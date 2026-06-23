"use client";

import { useEffect, useState } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";

import { CONTRACTS } from "@/lib/contracts";
import { readContract } from "@/lib/stellar";

interface PriceFeedData {
  price: number | null;
  loading: boolean;
  error: string | null;
}

async function fetchOracleXlmPrice(): Promise<number> {
  const rawPrice = await readContract(CONTRACTS.oracle, "get_price", [
    StellarSdk.nativeToScVal("XLM", { type: "symbol" }),
  ]);
  const normalized = typeof rawPrice === "bigint" ? rawPrice : BigInt(String(rawPrice));
  return Number(normalized) / 10_000_000;
}

export function usePriceFeed(intervalMs = 30_000): PriceFeedData {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function update() {
      try {
        const nextPrice = await fetchOracleXlmPrice();
        if (!active) return;
        setPrice(nextPrice);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Oracle price is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    update();
    const timer = window.setInterval(update, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return { price, loading, error };
}
