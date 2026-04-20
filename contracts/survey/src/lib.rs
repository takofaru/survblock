#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, BytesN, Env,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CitizenProfile {
    pub id_hash: BytesN<32>, // Cryptographic commitment to the Gov ID (e.g. Hash(ID_Number + Salt))
    pub is_verified: bool,   // Set by a Government Admin/Authority
    pub reputation: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SurveyInfo {
    pub owner: Address,
    pub min_reputation: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SurveySubmission {
    pub response_hash: BytesN<32>,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Survey(u64),
    Submission(u64, Address),
    Citizen(Address),
}

#[contract]
pub struct GovernmentGatewayContract;

#[contractimpl]
impl GovernmentGatewayContract {
    /// Initialize the contract with an admin (Government Authority)
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Citizens can register their identity by anchoring an ID hash.
    /// In a real-world scenario, this would be accompanied by a ZKP proof.
    pub fn register_citizen(env: Env, user: Address, id_hash: BytesN<32>) {
        user.require_auth();
        let key = DataKey::Citizen(user.clone());
        if env.storage().persistent().has(&key) {
            panic!("Citizen already registered");
        }
        
        let profile = CitizenProfile {
            id_hash,
            is_verified: false, // Default to unverified until Government Admin reviews
            reputation: 0,
        };
        env.storage().persistent().set(&key, &profile);
    }

    /// Government Authority (Admin) verifies a citizen's profile.
    pub fn verify_citizen(env: Env, admin: Address, citizen: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        if admin != stored_admin {
            panic!("Unauthorized: Only Admin can verify citizens");
        }

        let key = DataKey::Citizen(citizen.clone());
        let mut profile: CitizenProfile = env.storage().persistent().get(&key).expect("Citizen not registered");
        profile.is_verified = true;
        env.storage().persistent().set(&key, &profile);
    }

    /// Registers a new consultation (survey) instance
    pub fn create_survey(env: Env, owner: Address, survey_id: u64, min_reputation: u32) {
        owner.require_auth();
        if env.storage().instance().has(&DataKey::Survey(survey_id)) {
            panic!("Consultation already exists");
        }
        let info = SurveyInfo { owner, min_reputation };
        env.storage().instance().set(&DataKey::Survey(survey_id), &info);
    }

    /// Submit a response to a civic consultation. Requires a VERIFIED citizen profile.
    pub fn submit_response(
        env: Env,
        user: Address,
        survey_id: u64,
        response_hash: BytesN<32>,
    ) {
        user.require_auth();

        // 1. Verify citizen is registered and VERIFIED by the Government
        let citizen_key = DataKey::Citizen(user.clone());
        let mut profile: CitizenProfile = env.storage().persistent().get(&citizen_key).expect("Citizen not registered");
        
        if !profile.is_verified {
            panic!("Citizen identity not verified by Government Authority");
        }

        // 2. Verify survey exists and reputation threshold met
        let survey_key = DataKey::Survey(survey_id);
        let survey_info: SurveyInfo = env.storage().instance().get(&survey_key).expect("Consultation not found");
        
        if profile.reputation < survey_info.min_reputation {
            panic!("Insufficient reputation for this consultation");
        }

        // 3. Check for double submission
        let submission_key = DataKey::Submission(survey_id, user.clone());
        if env.storage().persistent().has(&submission_key) {
            panic!("Response already submitted");
        }

        // 4. Record submission
        let submission = SurveySubmission {
            response_hash,
            timestamp: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&submission_key, &submission);

        // 5. Reward civic engagement with reputation
        profile.reputation += 1;
        env.storage().persistent().set(&citizen_key, &profile);
    }

    /// Returns citizen profile details
    pub fn get_citizen(env: Env, user: Address) -> CitizenProfile {
        let key = DataKey::Citizen(user);
        env.storage().persistent().get(&key).expect("Citizen not found")
    }

    /// Returns survey metadata
    pub fn get_survey_info(env: Env, survey_id: u64) -> SurveyInfo {
        env.storage().instance().get(&DataKey::Survey(survey_id)).expect("Consultation not found")
    }
}

mod test;
