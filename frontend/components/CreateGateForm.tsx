"use client";

import { useState } from "react";
import * as StellarSdk from "@stellar/stellar-sdk";
import { CircleCheckIcon, ExternalLinkIcon, LockKeyholeIcon, TriangleAlertIcon } from "lucide-react";

import { useWallet } from "@/components/WalletConnect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CONTRACTS } from "@/lib/contracts";
import { callContract } from "@/lib/stellar";
import { cn } from "@/lib/utils";
import Link from "next/link";

type GateCondition = "PriceAbove" | "PriceBelow";

export default function CreateGateForm() {
  const { address, connected, loading: walletLoading, error: walletError, connect } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("");
  const [condition, setCondition] = useState<GateCondition>("PriceAbove");
  const [deadlineHours, setDeadlineHours] = useState("24");
  const [customDeadline, setCustomDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ gateId: string; txHash: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!connected || !address) {
      setError("Connect a Testnet Freighter wallet before creating an escrow.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!recipient.startsWith("G") || recipient.length !== 56) {
        throw new Error("Recipient must be a valid 56-character Stellar G-address.");
      }

      const parsedAmount = Number(amount);
      const parsedThreshold = Number(threshold);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) throw new Error("Lock amount must be positive.");
      if (!Number.isFinite(parsedThreshold) || parsedThreshold <= 0) throw new Error("Price target must be positive.");

      const amountStroops = BigInt(Math.round(parsedAmount * 10_000_000));
      const threshold7Dec = BigInt(Math.round(parsedThreshold * 10_000_000));

      let deadlineUnix: bigint;
      if (customDeadline) {
        const customDate = new Date(customDeadline);
        if (Number.isNaN(customDate.getTime()) || customDate.getTime() <= Date.now()) {
          throw new Error("Custom deadline must include a future date and time.");
        }
        deadlineUnix = BigInt(Math.floor(customDate.getTime() / 1000));
      } else {
        const hours = Number(deadlineHours);
        if (!Number.isFinite(hours) || hours <= 0) throw new Error("Select a deadline preset or enter a custom deadline.");
        deadlineUnix = BigInt(Math.floor(Date.now() / 1000 + hours * 3600));
      }

      const args = [
        StellarSdk.nativeToScVal(address, { type: "address" }),
        StellarSdk.nativeToScVal(recipient, { type: "address" }),
        StellarSdk.nativeToScVal(amountStroops, { type: "i128" }),
        StellarSdk.nativeToScVal(threshold7Dec, { type: "i128" }),
        StellarSdk.xdr.ScVal.scvVec([StellarSdk.xdr.ScVal.scvSymbol(condition)]),
        StellarSdk.nativeToScVal(deadlineUnix, { type: "u64" }),
      ];

      const response = await callContract(address, CONTRACTS.escrow, "create_gate", args);
      let gateId = "0";
      if (response.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS && response.returnValue) {
        gateId = StellarSdk.scValToNative(response.returnValue).toString();
      }

      setSuccess({ gateId, txHash: response.txHash });
      setAmount("");
      setRecipient("");
      setThreshold("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Escrow creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl [--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-3xl">Create price escrow</CardTitle>
        <CardDescription>Define the payout rule. Freighter will show the full transaction before signing.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {(error || walletError) && (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>Unable to continue</AlertTitle>
            <AlertDescription>{error || walletError}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CircleCheckIcon />
            <AlertTitle>Escrow #{success.gateId} created</AlertTitle>
            <AlertDescription>
              Your XLM is now locked under the selected condition.{" "}
              <span className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${success.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "link", size: "sm" }), "px-0")}
                >
                  View transaction
                  <ExternalLinkIcon data-icon="inline-end" />
                </a>
                <Link href="/escrows" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  View escrows
                </Link>
              </span>
            </AlertDescription>
          </Alert>
        )}

        <form id="create-gate-form" onSubmit={handleSubmit} className="w-full">
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-disabled={loading || undefined}>
                <FieldLabel htmlFor="amount">Lock amount (XLM)</FieldLabel>
                <Input id="amount" type="number" step="0.0000001" min="0.0000001" required disabled={loading} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="100" />
              </Field>

              <Field data-disabled={loading || undefined}>
                <FieldLabel htmlFor="condition">Condition</FieldLabel>
                <Select value={condition} onValueChange={(value) => value && setCondition(value as GateCondition)} disabled={loading}>
                  <SelectTrigger id="condition" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="PriceAbove">Price goes above</SelectItem>
                      <SelectItem value="PriceBelow">Price goes below</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-disabled={loading || undefined}>
                <FieldLabel htmlFor="threshold">Price target (USD)</FieldLabel>
                <Input id="threshold" type="number" step="0.0000001" min="0.0000001" required disabled={loading} value={threshold} onChange={(event) => setThreshold(event.target.value)} placeholder="0.30" />
              </Field>

              <Field data-disabled={loading || undefined}>
                <FieldLabel htmlFor="recipient">Recipient address</FieldLabel>
                <Input id="recipient" required disabled={loading} value={recipient} onChange={(event) => setRecipient(event.target.value.trim())} placeholder="G..." />
              </Field>
            </div>

              <Field data-disabled={loading || undefined}>
                <FieldLabel>Deadline preset</FieldLabel>
                <ToggleGroup
                  value={customDeadline ? [] : [deadlineHours]}
                  onValueChange={(values) => {
                  if (!values[0]) return;
                  setDeadlineHours(values[0]);
                  setCustomDeadline("");
                  }}
                  disabled={loading}
                  variant="outline"
                  className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3"
                >
                  <ToggleGroupItem value="1" className="w-full">1 hour</ToggleGroupItem>
                  <ToggleGroupItem value="24" className="w-full">1 day</ToggleGroupItem>
                  <ToggleGroupItem value="168" className="w-full">7 days</ToggleGroupItem>
                </ToggleGroup>
              </Field>

            <Field data-disabled={loading || undefined}>
              <FieldLabel htmlFor="custom-deadline">Custom deadline</FieldLabel>
              <Input
                id="custom-deadline"
                type="datetime-local"
                disabled={loading}
                value={customDeadline}
                onChange={(event) => {
                  setCustomDeadline(event.target.value);
                  if (event.target.value) setDeadlineHours("");
                }}
              />
              <FieldDescription>A custom value must include both date and time. Leave it empty to use the preset.</FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Testnet · Soroban escrow · Reflector pricing</p>
        {!connected ? (
          <Button type="button" onClick={connect} disabled={walletLoading} className="w-full sm:w-auto">
            {walletLoading ? <Spinner data-icon="inline-start" /> : <LockKeyholeIcon data-icon="inline-start" />}
            Connect wallet
          </Button>
        ) : (
          <Button type="submit" form="create-gate-form" disabled={loading} className="w-full sm:w-auto">
            {loading && <Spinner data-icon="inline-start" />}
            {loading ? "Awaiting signature" : "Create escrow"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
