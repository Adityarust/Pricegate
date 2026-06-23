import * as StellarSdk from "@stellar/stellar-sdk";

// Testnet config
export const NETWORK = "TESTNET" as const;
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

export const horizon = new StellarSdk.Horizon.Server(HORIZON_URL);
export const sorobanServer = new StellarSdk.rpc.Server(SOROBAN_RPC_URL);

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
