import * as StellarSdk from 'stellar-sdk';
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

const CONTRACT_ID = "CCB..."; // Replace with deployed contract ID
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const RPC_URL = "https://soroban-testnet.stellar.org";

const server = new StellarSdk.SorobanRpc.Server(RPC_URL);

/**
 * Submits a survey stage response to the Soroban contract.
 */
export async function submitStage(
  surveyId: number,
  stageId: number,
  responseHash: string, // 32-byte hex string
  issuerSignature: string // 64-byte hex string (mock signature for proof-of-humanity)
) {
  if (!(await isConnected())) {
    throw new Error("Freighter not connected");
  }

  const publicKey = await getPublicKey();
  if (!publicKey) throw new Error("Could not get public key");

  const userAccount = await server.getLatestLedger().then(() => server.getAccount(publicKey));

  // Prepare arguments for Soroban contract call
  // submit_stage_response(survey_id: u64, stage_id: u32, user: Address, response_hash: BytesN<32>, issuer_signature: BytesN<64>)
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(userAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "submit_stage_response",
        StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(surveyId.toString())),
        StellarSdk.xdr.ScVal.scvU32(stageId),
        StellarSdk.Address.fromString(publicKey).toScVal(),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(responseHash, 'hex')),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(issuerSignature, 'hex'))
      )
    )
    .setTimeout(30)
    .build();

  const signedTx = await signTransaction(tx.toXDR(), { network: 'TESTNET' });
  const result = await server.sendTransaction(new StellarSdk.Transaction(signedTx, NETWORK_PASSPHRASE));
  
  return result;
}

/**
 * Fetches survey metadata from the contract.
 */
export async function getSurveyInfo(surveyId: number) {
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const tx = new StellarSdk.TransactionBuilder(
    new StellarSdk.Account("G...", "0"), // Dummy account for read-only simulation
    { fee: "0", networkPassphrase: NETWORK_PASSPHRASE }
  )
    .addOperation(contract.call("get_survey_info", StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(surveyId.toString()))))
    .build();

  const result = await server.simulateTransaction(tx);
  // Parse simulation result...
  return result;
}
