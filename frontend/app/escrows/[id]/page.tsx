"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useWallet } from "@/components/WalletConnect";
import { escrowExplorerUrl } from "@/lib/explorer";
import { fetchGateById, type GateRecord } from "@/lib/gates";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-react";

function statusVariant(status: string) {
  if (status === "Released") return "secondary";
  if (status === "Refunded") return "destructive";
  return "outline";
}

export default function EscrowDetailPage() {
  const params = useParams<{ id: string }>();
  const escrowId = Number(params.id);
  const invalidEscrowId = !Number.isInteger(escrowId) || escrowId < 0;
  const { address, connected, loading: walletLoading, connect } = useWallet();
  const [escrow, setEscrow] = useState<GateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invalidEscrowId) {
      return;
    }

    let active = true;

    async function loadEscrow() {
      try {
        setLoading(true);
        const nextEscrow = await fetchGateById(escrowId);
        if (!active) return;
        setEscrow(nextEscrow);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setEscrow(null);
        setError(caught instanceof Error ? caught.message : "Unable to load escrow.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEscrow();
    return () => {
      active = false;
    };
  }, [escrowId, invalidEscrowId]);

  const isOwner = useMemo(() => Boolean(escrow && address && escrow.sender === address), [address, escrow]);

  if (invalidEscrowId) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Invalid escrow id</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <span>The route parameter is not a valid escrow id.</span>
            <Link href="/escrows" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}>
              Back to my escrows
            </Link>
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!connected) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect wallet</CardTitle>
            <CardDescription>Connect the wallet that created this escrow to view it.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={connect} disabled={walletLoading}>
              {walletLoading ? <Spinner data-icon="inline-start" /> : "Connect wallet"}
            </Button>
            <Link href="/escrows" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}>
              Back to my escrows
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error || !escrow) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Could not load escrow</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <span>{error || "The escrow does not exist."}</span>
            <Link href="/escrows" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}>
              Back to my escrows
            </Link>
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!isOwner) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Not your escrow</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <span>This escrow was created by a different wallet. Switch to the creator wallet to view it here.</span>
            <Link href="/escrows" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}>
              Back to my escrows
            </Link>
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-3xl">Escrow #{escrow.id}</CardTitle>
              <CardDescription>On-chain escrow record and current status.</CardDescription>
            </div>
            <Badge variant={statusVariant(escrow.status)}>{escrow.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Condition</p>
            <p className="mt-1 font-medium">{escrow.condition}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Threshold</p>
            <p className="mt-1 font-medium">${escrow.thresholdUsd.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="mt-1 font-medium">{escrow.amountXlm.toFixed(7)} XLM</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deadline</p>
            <p className="mt-1 font-medium">{new Date(escrow.deadline * 1000).toLocaleString()}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Sender</p>
            <p className="mt-1 break-all font-medium">{escrow.sender}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Recipient</p>
            <p className="mt-1 break-all font-medium">{escrow.recipient}</p>
          </div>
          <div className="sm:col-span-4">
            <Alert>
              <AlertTitle>Status from chain</AlertTitle>
              <AlertDescription>
                This page reflects the stored contract record. Settlement changes update the status once `check_and_release` runs.
              </AlertDescription>
            </Alert>
          </div>
          <div className="sm:col-span-4 flex flex-wrap gap-3">
            <Link href="/escrows" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}>
              Back to my escrows
            </Link>
            <Link href="/escrow/create" className={cn(buttonVariants(), "w-full sm:w-fit")}>
              Create another escrow
            </Link>
            <a href={escrowExplorerUrl()} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-fit")}>
              View on Stellar Explorer
              <ExternalLinkIcon data-icon="inline-end" />
            </a>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
