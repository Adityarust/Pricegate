"use client";

import { motion } from "framer-motion";
import { ShieldCheckIcon } from "lucide-react";

import CreateGateForm from "@/components/CreateGateForm";
import { Badge } from "@/components/ui/badge";

export default function CreateGatePage() {
  return (
    <section className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="flex flex-col gap-6 lg:sticky lg:top-28">
          <Badge variant="secondary" className="w-fit">
            <ShieldCheckIcon data-icon="inline-start" />
            Non-custodial by design
          </Badge>
          <h1 className="text-5xl leading-tight font-semibold tracking-tight sm:text-6xl">Turn a price target into a payout rule.</h1>
          <p className="max-w-lg text-lg leading-8 text-muted-foreground">
            Funds move only according to the condition you sign. The escrow contract holds XLM until settlement or expiry.
          </p>
          <dl className="grid grid-cols-2 gap-5 border-t pt-6">
            <div>
              <dt className="text-sm text-muted-foreground">Network</dt>
              <dd className="mt-1 font-medium">Stellar Testnet</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Price source</dt>
              <dd className="mt-1 font-medium">Reflector Oracle</dd>
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
