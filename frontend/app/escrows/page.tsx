"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, WalletIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useWallet } from "@/components/WalletConnect";
import { useGates } from "@/lib/hooks/useGates";
import { shortenAddress } from "@/lib/stellar";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function statusVariant(status: string) {
  if (status === "Released") return "secondary";
  if (status === "Refunded") return "destructive";
  return "outline";
}

export default function EscrowsPage() {
  const { address, connected, loading: walletLoading, error: walletError, connect } = useWallet();
  const { gates, loading, refreshing, error, lastUpdated } = useGates(5_000);
  const myEscrows = address ? gates.filter((gate) => gate.sender === address) : [];

  return (
    <section className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-4">
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">My escrows</Badge>
            {address && <Badge variant="outline">{shortenAddress(address)}</Badge>}
            {refreshing && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner />
                Refreshing every 5s
              </span>
            )}
            {lastUpdated && !refreshing && !loading && !error && (
              <span className="text-xs text-muted-foreground">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
            )}
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Escrows created by this wallet
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            This view only shows escrows created by the wallet you connected. The contract remains public, but the UI is scoped to the creator.
          </motion.p>
        </motion.div>

        {!connected ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect wallet</CardTitle>
              <CardDescription>Use the same wallet that created the escrow to see it here.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button onClick={connect} disabled={walletLoading}>
                {walletLoading ? <Spinner data-icon="inline-start" /> : <WalletIcon data-icon="inline-start" />}
                Connect wallet
              </Button>
              {walletError && (
                <Alert variant="destructive" className="w-full md:w-auto">
                  <AlertDescription>{walletError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-5 w-56" />
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load escrows</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : myEscrows.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No escrows for this wallet</CardTitle>
              <CardDescription>When this wallet creates an escrow, it will appear here automatically.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link href="/escrow/create" className={cn(buttonVariants(), "w-full sm:w-fit")}>
                Create an escrow
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myEscrows.map((escrow) => (
              <motion.div key={escrow.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                <Card>
                  <CardHeader className="gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-2xl">Escrow #{escrow.id}</CardTitle>
                        <CardDescription>
                          {escrow.condition === "PriceAbove" ? "Release when XLM rises above the target." : "Release when XLM falls below the target."}
                        </CardDescription>
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
                      <p className="text-sm text-muted-foreground">Recipient</p>
                      <p className="mt-1 break-all font-medium">{escrow.recipient}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Sender</p>
                      <p className="mt-1 break-all font-medium">{escrow.sender}</p>
                    </div>
                    <div className="sm:col-span-4">
              <Link href={`/escrows/${escrow.id}`} className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}>
                Open escrow details
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
