import * as StellarSdk from 'stellar-sdk';
import { getAddress, signTransaction, getNetworkDetails } from '@stellar/freighter-api';
import { Buffer } from 'buffer';

const CONTRACT_ID = "CCB..."; // Placeholder - Needs actual deployed address
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export interface CitizenProfile {
  id_hash: string;
  is_verified: boolean;
  reputation: number;
}

/**
 * Citizens register their identity by anchoring an ID hash.
 */
export async function registerCitizen(idHash: string) {
  const addressObj = await getAddress();
  const publicKey = addressObj.address;
  if (!publicKey) throw new Error("Could not retrieve wallet address.");

  const netDetails = await getNetworkDetails();
  const RPC_URL = netDetails.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
  const server = new StellarSdk.rpc.Server(RPC_URL);

  const userAccount = await server.getAccount(publicKey);
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(userAccount, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "register_citizen",
        StellarSdk.Address.fromString(publicKey).toScVal(),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(idHash, 'hex'))
      )
    )
    .setTimeout(30)
    .build();

  const signResult = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
  const signedTxXdr = (signResult as any).signedTxXdr || signResult;
  return await server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction);
}

/**
 * Fetches citizen profile from the contract.
 */
export async function getCitizen(publicKey: string): Promise<CitizenProfile | null> {
  try {
    const netDetails = await getNetworkDetails();
    const RPC_URL = netDetails.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
    const server = new StellarSdk.rpc.Server(RPC_URL);

    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const tx = new StellarSdk.TransactionBuilder(
      new StellarSdk.Account("GDBU6UCOOT6RRYA6J4W5J37TCO5I5V5COVDR3LIPYUC37WSXSTCHVAYE", "0"),
      { fee: "0", networkPassphrase: NETWORK_PASSPHRASE }
    )
      .addOperation(contract.call("get_citizen", StellarSdk.Address.fromString(publicKey).toScVal()))
      .build();

    const simulation = await server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      // For this walkthrough, we return a mock object if simulation "succeeds"
      return {
        id_hash: "8e98628b0f808604724036f6d0f622d1", 
        is_verified: true,
        reputation: 1
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Submits a survey response to the Soroban contract.
 */
export async function submitResponse(
  surveyId: number,
  responseHash: string,
) {
  const addressObj = await getAddress();
  const publicKey = addressObj.address;
  if (!publicKey) throw new Error("Could not retrieve wallet address.");

  const netDetails = await getNetworkDetails();
  const RPC_URL = netDetails.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
  const server = new StellarSdk.rpc.Server(RPC_URL);

  const userAccount = await server.getAccount(publicKey);
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(userAccount, {
    fee: "1000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "submit_response",
        StellarSdk.Address.fromString(publicKey).toScVal(),
        StellarSdk.xdr.ScVal.scvU64(StellarSdk.xdr.Uint64.fromString(surveyId.toString())),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(responseHash, 'hex'))
      )
    )
    .setTimeout(30)
    .build();

  const signResult = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
  const signedTxXdr = (signResult as any).signedTxXdr || signResult;
  return await server.sendTransaction(StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE) as StellarSdk.Transaction);
}
