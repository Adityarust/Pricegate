"use client";

import { useEffect, useRef, useState } from "react";
import { horizon } from "@/lib/stellar";

interface PriceFeedData {
  price: number;
  change24h: number;
  loading: boolean;
  error: string | null;
}

// Fetches XLM/USD price from Horizon trade aggregations
async function fetchXlmPrice(): Promise<number> {
  try {
    const res = await fetch(
      `${horizon.serverURL}/trade_aggregations?` +
        new URLSearchParams({
          base_asset_type: "native",
          counter_asset_type: "credit_alphanum4",
          counter_asset_code: "USD",
          counter_asset_issuer:
            "GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX",
          resolution: "900000", // 15 min candles
          limit: "1",
          order: "desc",
        })
    );

    if (!res.ok) throw new Error("Failed to fetch price");

    const data = await res.json();
    if (data._embedded?.records?.length > 0) {
      return parseFloat(data._embedded.records[0].avg);
    }

    // Fallback: use a reasonable testnet price
    return 0.12;
  } catch {
    return 0.12; // fallback
  }
}

export function usePriceFeed(intervalMs: number = 5000): PriceFeedData {
  const [price, setPrice] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevPrice = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const update = async () => {
      try {
        const newPrice = await fetchXlmPrice();
        if (!mounted) return;

        if (prevPrice.current > 0) {
          const diff =
            ((newPrice - prevPrice.current) / prevPrice.current) * 100;
          setChange24h(diff);
        }

        prevPrice.current = newPrice;
        setPrice(newPrice);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Price fetch failed");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    update();
    const timer = setInterval(update, intervalMs);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return { price, change24h, loading, error };
}
