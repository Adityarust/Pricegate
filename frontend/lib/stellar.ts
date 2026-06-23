import * as StellarSdk from "@stellar/stellar-sdk";

// Testnet config
export const NETWORK = "TESTNET" as const;
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
const READ_ONLY_SOURCE_ADDRESS = "GDYC2AUKPBCFS24PIUYXUWPYL46QIQCELNUPTXA6B4SNNNTQJM2BBVP7";

export const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);
export const sorobanServer = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

// Simulates a read-only contract invocation. No wallet signature or transaction
// submission is required, but the simulation still needs an existing source account.
export async function readContract(
  contractAddress: string,
  functionName: string,
  args: StellarSdk.xdr.ScVal[] = []
): Promise<unknown> {
  const account = await sorobanServer.getAccount(READ_ONLY_SOURCE_ADDRESS);
  const contract = new StellarSdk.Contract(contractAddress);
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build();

  const simulation = await sorobanServer.simulateTransaction(transaction);
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Oracle simulation failed: ${simulation.error}`);
  }
  if (!simulation.result) {
    throw new Error("Oracle simulation returned no value.");
  }

  return StellarSdk.scValToNative(simulation.result.retval);
}

// Format stroops to XLM (7 decimals)
export function stroopsToXlm(stroops: bigint | number | string): string {
  const val = BigInt(stroops);
  const whole = val / 10_000_000n;
  const frac = val % 10_000_000n;
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : `${whole}`;
}
// Format price with 7 decimals to dollar string
export function formatPrice(price7dec: bigint | number | string): string {
  const val = BigInt(price7dec);
  const whole = val / 10_000_000n;
  const frac = (val % 10_000_000n).toString().padStart(7, "0").slice(0, 4);
  return `$${whole}.${frac}`;
}

// Shorten Stellar address for display
export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Invokes a contract function by building, simulating, signing, and submitting the transaction.
export async function callContract(
  senderAddress: string,
  contractAddress: string,
  functionName: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.rpc.Api.GetTransactionResponse> {
  const { signTransaction } = await import("@stellar/freighter-api");

  // 1. Fetch sequence number and load account
  const account = await horizon.loadAccount(senderAddress);

  // 2. Build the initial transaction structure
  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100", // Placeholder base fee (prepareTransaction will estimate and override)
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.invokeContractFunction({
        contract: contractAddress,
        function: functionName,
        args: args,
      })
    )
    .setTimeout(StellarSdk.TimeoutInfinite)
    .build();

  // 3. Simulate and prepare transaction (handles foot-print and fee estimates)
  tx = await sorobanServer.prepareTransaction(tx);

  // 4. Sign transaction using Freighter wallet
  const signed = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
  if (signed.error) {
    throw new Error(signed.error.message || "User rejected the transaction");
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    NETWORK_PASSPHRASE
  );

  // 5. Submit to the Soroban RPC network
  const sendResponse = await sorobanServer.sendTransaction(signedTx);
  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  // 6. Poll until transaction is finalized
  const getResponse = await sorobanServer.pollTransaction(sendResponse.hash);

  if (getResponse.status === "SUCCESS") {
    return getResponse;
  } else {
    throw new Error(
      `Transaction execution failed: ${JSON.stringify(getResponse)}`
    );
  }
}
