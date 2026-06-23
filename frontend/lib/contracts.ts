// Contract addresses (deploy-time config)
// These will be populated after deploying contracts to testnet

export const CONTRACTS = {
  oracle: process.env.NEXT_PUBLIC_ORACLE_CONTRACT_ID || "",
  escrow: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "",
} as const;

// Reflector Pulse oracle testnet address
export const REFLECTOR_ORACLE_ADDRESS =
  "CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP";

// XLM Stellar Asset Contract address (native token SAC on testnet)
export const XLM_SAC_ADDRESS =
  process.env.NEXT_PUBLIC_XLM_SAC_ADDRESS || "";

// Gate condition types matching the contract enum
export type Condition = "PriceAbove" | "PriceBelow";

export type Status = "Locked" | "Released" | "Refunded";

export interface GateConfig {
  sender: string;
  recipient: string;
  amount: bigint;
  threshold: bigint;
  condition: Condition;
  deadline: number;
  status: Status;
}
