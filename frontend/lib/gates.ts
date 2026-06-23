import * as StellarSdk from "@stellar/stellar-sdk";

import { CONTRACTS } from "@/lib/contracts";
import { readContract } from "@/lib/stellar";

export type GateCondition = "PriceAbove" | "PriceBelow";
export type GateStatus = "Locked" | "Released" | "Refunded";

export interface GateRecord {
  id: number;
  sender: string;
  recipient: string;
  amountXlm: number;
  thresholdUsd: number;
  condition: GateCondition;
  deadline: number;
  status: GateStatus;
}

function toNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return Number(value);
}

function toAddress(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) return String(value);
  return String(value);
}

export async function fetchGateCount(): Promise<number> {
  const raw = await readContract(CONTRACTS.escrow, "get_gate_count", []);
  return toNumber(raw);
}

export async function fetchGateById(id: number): Promise<GateRecord> {
  const raw = await readContract(CONTRACTS.escrow, "get_gate", [StellarSdk.nativeToScVal(BigInt(id), { type: "u64" })]);
  const gate = raw as {
    sender: unknown;
    recipient: unknown;
    amount: unknown;
    threshold: unknown;
    condition: unknown;
    deadline: unknown;
    status: unknown;
  };

  return {
    id,
    sender: toAddress(gate.sender),
    recipient: toAddress(gate.recipient),
    amountXlm: toNumber(gate.amount) / 10_000_000,
    thresholdUsd: toNumber(gate.threshold) / 10_000_000,
    condition: String(gate.condition) as GateCondition,
    deadline: toNumber(gate.deadline),
    status: String(gate.status) as GateStatus,
  };
}

export async function fetchGates(): Promise<GateRecord[]> {
  const count = await fetchGateCount();
  const ids = Array.from({ length: count }, (_, index) => index);
  const gates = await Promise.all(ids.map((id) => fetchGateById(id)));
  return gates.reverse();
}
