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
    let timer: number | null = null;
    let source: EventSource | null = null;

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

    async function startPollingFallback() {
      if (!active) return;
      await update();
      timer = window.setInterval(update, intervalMs);
    }

    async function startStream() {
      await update();
      if (!active) return;

      source = new EventSource("/api/gates/stream");
      source.onmessage = (event) => {
        if (!active) return;
        try {
          const nextPayload = JSON.parse(event.data) as GateRecord[] | { error?: string };
          if (Array.isArray(nextPayload)) {
            setGates(nextPayload);
            setError(null);
            setLastUpdated(Date.now());
            setLoading(false);
            setRefreshing(false);
            firstRun = false;
            return;
          }

          if (nextPayload && typeof nextPayload.error === "string") {
            setError(nextPayload.error);
          }
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Unable to parse gate updates.");
        }
      };
      source.onerror = () => {
        if (!active) return;
        source?.close();
        source = null;
        void startPollingFallback();
      };
    }

    void startStream();

    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      source?.close();
    };
  }, [intervalMs]);

  return { gates, loading, refreshing, error, lastUpdated };
}
