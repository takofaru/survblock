# Sovereign Government Gateway (VerifySurvey)

**Sovereign Government Gateway** is a decentralized civic infrastructure built on the **Stellar Network**. It empowers citizens with secure, blockchain-anchored identities while providing government authorities a privacy-preserving platform for high-integrity public consultations and referendums.

---

## 📖 Explanation (Architecture & Design)

The system is designed as a "Privacy-First Civic Portal." It leverages the **Soroban Smart Contract** environment to create a trustless relationship between citizens and the state.

### Core Philosophy
- **Identity Anchoring:** Unlike traditional databases, we don't store your ID documents. We store a cryptographic "commitment" (SHA-256 hash). This allows you to prove your identity without exposing PII (Personally Identifiable Information).
- **Verified Humanity:** Citizens must be verified by a Government Authority (Admin) on-chain before participating in official referendums, preventing bot manipulation and fraud.
- **Data Sovereignty:** All consultation responses are encrypted locally (AES-256) before submission. Only a hash of the encrypted data is recorded on the blockchain.

### Technical Layers
1.  **Identity Layer:** Uses Soroban persistent storage to maintain `CitizenProfile` objects (ID Hash, Verification Status, Civic XP).
2.  **Engagement Layer:** Tracks "Civic XP" (Reputation). Active participation in consultations builds a citizen's reputation, which can be used to gate high-stakes referendums.
3.  **Security Layer:** Integrated with **Freighter Wallet** for transaction signing and **AES-256** for client-side encryption.

---

## 🛠️ Setup (Installation & Configuration)

### Prerequisites
- **Rust & Cargo:** [Install Rust](https://rustup.rs/)
- **Node.js & npm:** [Install Node.js](https://nodejs.org/)
- **Stellar CLI:** `cargo install --locked stellar-cli`
- **Freighter Wallet:** Install the [Freighter browser extension](https://www.freighter.app/) and switch to **Testnet**.

### 1. Smart Contract Setup
Navigate to the contract directory to build and test the gateway logic:
```bash
cd contracts/survey
# Run the civic lifecycle tests
cargo test
# Build the WASM binary
stellar contract build
```

### 2. Frontend Setup
Install dependencies and launch the citizen portal:
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Usage (How to Use)

### 1. Citizen Registration
- Open the portal at `http://localhost:5173`.
- Click **"Authenticate with Freighter"** to connect your wallet.
- Enter your Legal Name and Government ID Number.
- Click **"Anchor Identity"**. The app will hash your data locally and anchor it to Stellar.

### 2. Digital ID Dashboard
- Once registered, you will see your **Sovereign Citizen ID Card**.
- Check your **Verification Status**. (In Simulation Mode, this is pre-verified; in Production, an Admin must call `verify_citizen`).
- View your **Civic XP** (Engagement Score).

### 3. Participating in Consultations
- Browse the available **Civic Consultations** (e.g., Urban Reforestation, Data Privacy Act).
- Answer the questions. Your responses are encrypted in the browser.
- Click **"Sign & Submit to Gateway"**. This submits a transaction to Soroban that records your encrypted response hash and rewards you with **Civic XP**.

### 4. Simulation Mode
- Use the **"Simulation Mode"** toggle in the header to walkthrough the entire UI flow without requiring a live contract deployment or Testnet XLM.

---

### ID Contract
CDX7DN25SBNLR4JPP7WFRQPNEVFN3A3HLXNV6JFDDL47XMKTZ5PERQXK

**Sovereign Government Gateway** - Empowering the individual through blockchain transparency and cryptographic privacy.
