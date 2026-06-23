// Canonical PriceGate Testnet deployment.
// Environment variables can override these values after a redeployment.

export const CONTRACTS = {
  oracle:
    process.env.NEXT_PUBLIC_ORACLE_CONTRACT_ID ||
    "CCS7PLDSW3KQJC5QDEMGFFMTEFPG2DDYPGQFXNQ6WURJSNPWTN466STU",
  escrow:
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ||
    "CCSLZPGH365KUILNPFQ54HOQOSBWRL5Y5OVFP4M5S22GTDTYVCJV6TGM",
} as const;

// Reflector Pulse oracle testnet address
export const REFLECTOR_ORACLE_ADDRESS =
  "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63";

// XLM Stellar Asset Contract address (native token SAC on testnet)
export const XLM_SAC_ADDRESS =
  process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// Gate condition types matching the contract enum
export type Condition =
  | { kind: "PriceAbove"; threshold: bigint }
  | { kind: "PriceBelow"; threshold: bigint }
  | { kind: "PriceRange"; min: bigint; max: bigint };

export type Status = "Locked" | "Released" | "Refunded";

export interface GateConfig {
  sender: string;
  recipient: string;
  amount: bigint;
  condition: Condition;
  deadline: number;
  status: Status;
}
