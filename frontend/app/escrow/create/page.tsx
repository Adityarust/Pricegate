"use client";

import { motion } from "framer-motion";
import { ShieldCheckIcon } from "lucide-react";

import CreateGateForm from "@/components/CreateGateForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceFeed } from "@/lib/hooks/usePriceFeed";

export default function CreateEscrowPage() {
  const { price, loading, refreshing, error } = usePriceFeed(5_000);

  return (
    <section className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="flex flex-col gap-6 lg:sticky lg:top-28">
          <Badge variant="secondary" className="w-fit">
            <ShieldCheckIcon data-icon="inline-start" />
            Non-custodial by design
          </Badge>
          <h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-6xl">Turn a price target into a payout rule.</h1>
          <p className="max-w-lg text-sm leading-7 text-muted-foreground sm:text-lg">
            Funds move only according to the condition you sign. The escrow contract holds XLM until settlement or expiry.
          </p>
          <dl className="grid grid-cols-1 gap-5 border-t pt-6 text-sm sm:grid-cols-2 sm:text-base">
            <div>
              <dt className="text-sm text-muted-foreground">Network</dt>
              <dd className="mt-1 font-medium">Stellar Testnet</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Price source</dt>
              <dd className="mt-1 font-medium">Reflector Oracle</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-muted-foreground">XLM price</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-3 font-medium">
                {loading ? (
                  <Skeleton className="h-6 w-28 rounded-full" />
                ) : error ? (
                  <Alert variant="destructive" className="w-full">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : (
                  <>
                <Badge variant="outline" className="max-w-full truncate">{price === null ? "Unavailable" : `$${price.toFixed(4)}`}</Badge>
                    {refreshing && <span className="text-xs text-muted-foreground">Updating every 5s</span>}
                  </>
                )}
              </dd>
            </div>
          </dl>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}>
          <CreateGateForm />
        </motion.div>
      </div>
    </section>
  );
}
