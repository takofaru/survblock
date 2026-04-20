#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _};
use soroban_sdk::{Address, BytesN, Env};

#[test]
fn test_survey_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    let owner = Address::generate(&env);

    // 1. Init
    client.init(&admin, &issuer);

    // 2. Create Survey
    let survey_id = 1;
    let total_stages = 3;
    client.create_survey(&survey_id, &owner, &total_stages);

    let info = client.get_survey_info(&survey_id);
    assert_eq!(info.total_stages, 3);
    assert_eq!(info.owner, owner);

    // 3. Submit Stage 1
    let hash1 = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_stage_response(&survey_id, &1, &user, &hash1, &sig);

    let sub1 = client.get_submission(&survey_id, &1, &user);
    assert_eq!(sub1.response_hash, hash1);

    // 4. Submit Stage 2
    let hash2 = BytesN::from_array(&env, &[2; 32]);
    client.submit_stage_response(&survey_id, &2, &user, &hash2, &sig);

    // 5. Fail double submission (using try_ for graceful failure check if available, or just asserting panic)
    // In Soroban tests, we often just check if it panics or use try_ functions if generated.
}

#[test]
#[should_panic(expected = "Stage already submitted")]
fn test_duplicate_submission() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);
    client.create_survey(&1, &admin, &3);

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_stage_response(&1, &1, &user, &hash, &sig);
    client.submit_stage_response(&1, &1, &user, &hash, &sig);
}

#[test]
#[should_panic(expected = "Invalid stage ID")]
fn test_invalid_stage() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, SurveyContract);
    let client = SurveyContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let issuer = Address::generate(&env);
    let user = Address::generate(&env);
    client.init(&admin, &issuer);
    client.create_survey(&1, &admin, &3);

    let hash = BytesN::from_array(&env, &[1; 32]);
    let sig = BytesN::from_array(&env, &[0; 64]);
    client.submit_stage_response(&1, &4, &user, &hash, &sig);
}
