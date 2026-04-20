# Sovereign Government Gateway (VerifySurvey)

**Sovereign Government Gateway** - Decentralized Civic Identity & Public Consultation Hub powered by Stellar.

## Project Description

The Sovereign Government Gateway is a blockchain-based platform designed to transform how citizens interact with public services. Built on the **Stellar network** using **Soroban smart contracts**, it provides a secure, privacy-preserving infrastructure for anchoring government-issued identities and conducting high-integrity public consultations.

Unlike traditional systems, the Gateway ensures that every interaction is conducted by a verified unique human (Sovereign Citizen) without ever storing sensitive personal documents in plaintext.

## Key Features

### 1. **Sovereign Citizen Registration**
- **Blockchain Anchoring:** Citizens anchor a cryptographic hash of their Government ID (Legal Name + ID Number) to the Stellar blockchain.
- **Privacy-First:** The raw ID data never leaves the citizen's device. Only a one-way fingerprint (SHA-256) is recorded on-chain.
- **Verification Tiers:** Profiles are marked as "Verified" only after a Government Authority (Contract Admin) validates the anchored hash.

### 2. **Digital Citizen ID Card**
- A secure dashboard displaying the citizen's decentralized identity status.
- **Reputation (XP):** Citizens earn reputation points for active participation in public consultations, building their "Civic Engagement" score.

### 3. **Public Consultations & Referendums**
- Organizations and Government branches can host official surveys and referendums.
- **Access Control:** Consultations can require a minimum reputation score, ensuring high-quality feedback from experienced citizens.
- **Anti-Fraud:** The smart contract prevents double-voting and ensures only verified citizens can participate.

### 4. **Privacy-Preserving Referendums**
- All consultation responses are encrypted using **AES-256** client-side before submission.
- Only the cryptographic commitment (hash) of the encrypted payload is stored on the ledger.

## Technical Architecture

- **Identity Layer:** Soroban persistent storage stores `CitizenProfile` (ID Hash, Verification Status, Reputation).
- **Service Layer:** Soroban instance storage manages `SurveyInfo` and consultation metadata.
- **Transaction Layer:** Stellar network provides the immutable, timestamped record of all civic activities.

## Getting Started

### Smart Contract (Gateway Logic)
```bash
cd contracts/survey
cargo test # Run full civic lifecycle tests
stellar contract build # Build the WASM gateway
```

### Frontend (Portal UI)
```bash
cd frontend
npm install
npm run dev
```

---

**Sovereign Government Gateway** - Empowering Citizens through Blockchain Transparency.
