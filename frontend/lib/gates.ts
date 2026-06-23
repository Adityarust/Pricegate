import * as StellarSdk from "@stellar/stellar-sdk";

import { CONTRACTS } from "@/lib/contracts";
import { readContract } from "@/lib/stellar";

export type GateCondition =
  | { kind: "PriceAbove"; thresholdUsd: number }
  | { kind: "PriceBelow"; thresholdUsd: number }
  | { kind: "PriceRange"; minPriceUsd: number; maxPriceUsd: number };

export type GateStatus = "Locked" | "Released" | "Refunded";

export interface GateRecord {
  id: number;
  sender: string;
  recipient: string;
  amountXlm: number;
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

export function decodeGateCondition(raw: unknown): GateCondition {
  if (raw && typeof raw === "object" && !Array.isArray(raw) && "tag" in raw) {
    const condition = raw as { tag: unknown; values?: unknown[] };
    const kind = String(condition.tag);
    const values = condition.values ?? [];

    if (kind === "PriceAbove") {
      return { kind, thresholdUsd: toNumber(values[0]) / 10_000_000 };
    }
    if (kind === "PriceBelow") {
      return { kind, thresholdUsd: toNumber(values[0]) / 10_000_000 };
    }
    if (kind === "PriceRange") {
      return {
        kind,
        minPriceUsd: toNumber(values[0]) / 10_000_000,
        maxPriceUsd: toNumber(values[1]) / 10_000_000,
      };
    }
  }

  if (typeof raw === "string") {
    if (raw === "PriceBelow") {
      return { kind: "PriceBelow", thresholdUsd: 0 };
    }
    return { kind: "PriceAbove", thresholdUsd: 0 };
  }

  return { kind: "PriceAbove", thresholdUsd: 0 };
}

export function describeGateCondition(condition: GateCondition): string {
  switch (condition.kind) {
    case "PriceAbove":
      return `Price above target · $${condition.thresholdUsd.toFixed(4)}`;
    case "PriceBelow":
      return `Price below target · $${condition.thresholdUsd.toFixed(4)}`;
    case "PriceRange":
      return `Price stays in range · $${condition.minPriceUsd.toFixed(4)}–$${condition.maxPriceUsd.toFixed(4)}`;
  }
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
    condition: unknown;
    deadline: unknown;
    status: unknown;
  };

  return {
    id,
    sender: toAddress(gate.sender),
    recipient: toAddress(gate.recipient),
    amountXlm: toNumber(gate.amount) / 10_000_000,
    condition: decodeGateCondition(gate.condition),
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
