#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _};
use soroban_sdk::{Address, BytesN, Env};

#[test]
fn test_government_gateway_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(GovernmentGatewayContract, ());
    let client = GovernmentGatewayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let id_hash = BytesN::from_array(&env, &[1; 32]);

    // 1. Init Gateway
    client.init(&admin);

    // 2. Citizen Registration
    client.register_citizen(&user, &id_hash);
    
    let profile = client.get_citizen(&user);
    assert_eq!(profile.is_verified, false);
    assert_eq!(profile.id_hash, id_hash);

    // 3. Admin Verification
    client.verify_citizen(&admin, &user);
    assert_eq!(client.get_citizen(&user).is_verified, true);

    // 4. Create Consultation
    let survey_id = 101;
    client.create_survey(&admin, &survey_id, &0);

    // 5. Submit Response
    let response_hash = BytesN::from_array(&env, &[2; 32]);
    client.submit_response(&user, &survey_id, &response_hash);

    // 6. Verify reputation gain
    assert_eq!(client.get_citizen(&user).reputation, 1);
}

#[test]
#[should_panic(expected = "Citizen identity not verified by Government Authority")]
fn test_unverified_citizen_rejection() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GovernmentGatewayContract, ());
    let client = GovernmentGatewayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let id_hash = BytesN::from_array(&env, &[1; 32]);

    client.init(&admin);
    client.register_citizen(&user, &id_hash); // Not verified
    client.create_survey(&admin, &1, &0);

    let response_hash = BytesN::from_array(&env, &[2; 32]);
    client.submit_response(&user, &1, &response_hash);
}

#[test]
#[should_panic(expected = "Insufficient reputation for this consultation")]
fn test_reputation_threshold() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(GovernmentGatewayContract, ());
    let client = GovernmentGatewayContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let id_hash = BytesN::from_array(&env, &[1; 32]);

    client.init(&admin);
    client.register_citizen(&user, &id_hash);
    client.verify_citizen(&admin, &user);
    
    client.create_survey(&admin, &1, &5); // Requires 5 reputation

    let response_hash = BytesN::from_array(&env, &[2; 32]);
    client.submit_response(&user, &1, &response_hash);
}
