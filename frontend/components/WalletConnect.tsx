"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isConnected,
  getAddress,
  requestAccess,
} from "@stellar/freighter-api";
import { shortenAddress } from "@/lib/stellar";

interface WalletState {
  address: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    loading: true,
    error: null,
  });

  // Check if already connected on mount
  useEffect(() => {
    const check = async () => {
      try {
        const connected = await isConnected();
        if (connected) {
          const { address } = await getAddress();
          if (address) {
            setState({
              address,
              connected: true,
              loading: false,
              error: null,
            });
            return;
          }
        }
      } catch {
        // Freighter not installed or not connected
      }
      setState((s) => ({ ...s, loading: false }));
    };
    check();
  }, []);

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { address } = await requestAccess();
      setState({
        address,
        connected: true,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({
        address: null,
        connected: false,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to connect wallet",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      connected: false,
      loading: false,
      error: null,
    });
  }, []);

  return { ...state, connect, disconnect };
}

export default function WalletConnect() {
  const { address, connected, loading, error, connect, disconnect } =
    useWallet();

  if (loading) {
    return (
      <button className="btn-secondary opacity-70 cursor-wait" disabled>
        <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
        Connecting...
      </button>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass-card text-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
          <span className="font-mono text-gray-300">
            {shortenAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="btn-secondary text-sm !px-4 !py-2 hover:text-danger"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={connect} className="btn-primary text-sm !px-5 !py-2.5">
        Connect Wallet
      </button>
      {error && (
        <span className="text-xs text-danger max-w-[200px] truncate">
          {error}
        </span>
      )}
    </div>
  );
}
