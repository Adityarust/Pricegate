"use client";

import { useEffect, useState } from "react";

import type { GateRecord } from "@/lib/gates";
import { fetchGates } from "@/lib/gates";

interface GateFeedData {
  gates: GateRecord[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  lastUpdated: number | null;
}

export function useGates(intervalMs = 5_000): GateFeedData {
  const [gates, setGates] = useState<GateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    let firstRun = true;

    async function update() {
      if (!firstRun) setRefreshing(true);
      try {
        const nextGates = await fetchGates();
        if (!active) return;
        setGates(nextGates);
        setError(null);
        setLastUpdated(Date.now());
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Unable to load gates.");
      } finally {
        if (active) setLoading(false);
        if (active) setRefreshing(false);
        firstRun = false;
      }
    }

    update();
    const timer = window.setInterval(update, intervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return { gates, loading, refreshing, error, lastUpdated };
}
