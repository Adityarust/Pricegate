import { CONTRACTS } from "@/lib/contracts";

const STELLAR_EXPERT_TESTNET = "https://stellar.expert/explorer/testnet";

export function escrowExplorerUrl(): string {
  return `${STELLAR_EXPERT_TESTNET}/contract/${CONTRACTS.escrow}`;
}
