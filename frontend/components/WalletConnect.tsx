"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getAddress, getNetwork, isConnected, requestAccess } from "@stellar/freighter-api";
import { PlugIcon, UnplugIcon, WalletIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { shortenAddress } from "@/lib/stellar";

interface WalletState {
  address: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
  network: string | null;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function withTimeout<T>(promise: Promise<T>, timeoutMs = 15_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      window.setTimeout(() => reject(new Error("Freighter did not respond. Unlock the extension and try again.")), timeoutMs)
    ),
  ]);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    loading: true,
    error: null,
    network: null,
  });

  useEffect(() => {
    let active = true;

    async function restoreConnection() {
      try {
        const connection = await isConnected();
        if (connection.error || !connection.isConnected) return;

        const addressResult = await getAddress();
        if (addressResult.error || !addressResult.address) return;

        const networkResult = await getNetwork();
        if (!active) return;
        setState({
          address: addressResult.address,
          connected: true,
          loading: false,
          error: null,
          network: networkResult.error ? null : networkResult.network,
        });
      } catch {
        // A missing or locked extension is a valid disconnected state on load.
      } finally {
        if (active) setState((current) => ({ ...current, loading: false }));
      }
    }

    restoreConnection();
    return () => {
      active = false;
    };
  }, []);

  const connect = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const connection = await isConnected();
      if (connection.error || !connection.isConnected) {
        throw new Error("Freighter wallet was not detected. Install or enable the browser extension.");
      }

      const access = await withTimeout(requestAccess());
      if (access.error) throw new Error(access.error.message || "Wallet access was denied.");
      if (!access.address) throw new Error("Freighter returned no wallet address.");

      const networkResult = await getNetwork();
      const network = networkResult.error ? null : networkResult.network;
      if (network && network !== "TESTNET") {
        throw new Error(`Switch Freighter to TESTNET. It is currently using ${network}.`);
      }

      setState({
        address: access.address,
        connected: true,
        loading: false,
        error: null,
        network,
      });
    } catch (error) {
      setState({
        address: null,
        connected: false,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to connect Freighter.",
        network: null,
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, connected: false, loading: false, error: null, network: null });
  }, []);

  const value = useMemo(() => ({ ...state, connect, disconnect }), [state, connect, disconnect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider.");
  return context;
}

export default function WalletConnect() {
  const { address, connected, loading, error, network, connect, disconnect } = useWallet();

  if (loading) {
    return (
      <Button variant="outline" disabled className="w-full sm:w-auto">
        <Spinner data-icon="inline-start" />
        Connecting
      </Button>
    );
  }

  if (connected && address) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        <Badge variant="secondary" className="w-full justify-center sm:w-auto">
          <WalletIcon data-icon="inline-start" />
          {shortenAddress(address)} · {network ?? "Stellar"}
        </Badge>
        <Button variant="outline" size="sm" onClick={disconnect} className="w-full sm:w-auto">
          <UnplugIcon data-icon="inline-start" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={connect} className="w-full sm:w-auto">
          <PlugIcon data-icon="inline-start" />
          Connect Wallet
        </Button>
      </div>
      {error && (
        <Alert variant="destructive" className="w-full max-w-full sm:max-w-md">
          <AlertTitle>Wallet connection failed</AlertTitle>
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
