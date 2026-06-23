"use client";

import { motion } from "framer-motion";
import { ArrowRightIcon, EyeIcon, LockKeyholeIcon, SendIcon, ShieldCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BoidsEcosystem from "@/components/BoidsEcosystem";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceFeed } from "@/lib/hooks/usePriceFeed";
import { cn } from "@/lib/utils";

const features = [
  {
    step: "01",
    title: "Lock XLM",
    description: "Deposit XLM into a Soroban escrow with a recipient, price condition, and clear expiry.",
    icon: LockKeyholeIcon,
  },
  {
    step: "02",
    title: "Oracle Watches",
    description: "Reflector supplies the contract with an on-chain XLM/USD reference price.",
    icon: EyeIcon,
  },
  {
    step: "03",
    title: "Release Securely",
    description: "Anyone can trigger settlement. Matching conditions release funds; expiry returns them.",
    icon: SendIcon,
  },
];

const stats = [
  { value: "100%", label: "On-chain escrow" },
  { value: "<5s", label: "Ledger finality" },
  { value: "2", label: "Soroban contracts" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const { price, loading, error } = usePriceFeed();

  return (
    <div className="overflow-hidden">
      <section id="features" className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col items-center justify-center overflow-hidden bg-[#faf5ea] px-5 py-20 text-center lg:px-8 lg:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <BoidsEcosystem
            count={160}
            background="#faf5ea"
            agentShape="dot"
            cursorRadius={96}
            palette={["#4f60e0", "#6475e8", "#7f8ff0", "#9ba9f4"]}
            className="absolute inset-0 rounded-none border-0 shadow-none"
          />
          <div className="absolute inset-0 bg-[#faf5ea]/34" />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
          className="relative z-10 flex max-w-4xl flex-col items-center gap-7"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.8 }}>
            <Badge variant="secondary" className="h-7 px-3">
              <ShieldCheckIcon data-icon="inline-start" />
              Stellar Network Powered
            </Badge>
          </motion.div>

          <h1 className="flex flex-col text-4xl leading-[0.98] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            <motion.span variants={fadeUp} transition={{ duration: 0.8 }}>Lock funds.</motion.span>
            <motion.span
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: "easeOut" }}
              className="text-primary"
            >
              Set conditions.
            </motion.span>
            <motion.span variants={fadeUp} transition={{ duration: 0.8 }}>Settle with certainty.</motion.span>
          </h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.8 }} className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-lg">
            PriceGate turns a market condition into an enforceable Stellar escrow. No custodian, no manual payout, and no ambiguity.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <motion.a
              href="/escrow/create"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(buttonVariants({ size: "lg" }), "relative w-full max-w-xs overflow-hidden sm:w-auto sm:min-w-40")}
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-y-0 w-8 -skew-x-12 bg-primary-foreground/15"
                initial={{ left: "-20%" }}
                whileHover={{ left: "120%" }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
              Create Escrow
              <ArrowRightIcon data-icon="inline-end" />
            </motion.a>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full max-w-xs sm:w-auto sm:min-w-40")}
            >
              See how it works
            </motion.a>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="flex w-full flex-col items-center gap-3 sm:w-auto">
            {loading ? (
              <Skeleton className="h-8 w-44 rounded-full" />
            ) : error ? (
              <Alert variant="destructive" className="w-full max-w-md text-left">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <Badge variant="outline">XLM/USD {price === null ? "Unavailable" : `$${price.toFixed(4)}`}</Badge>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 mt-20 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} whileHover={{ y: -2, scale: 1.01 }} transition={{ duration: 0.25, ease: "easeOut" }}>
              <Card className="h-full bg-white/75 text-center shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">{stat.value}</CardTitle>
                  <CardDescription>{stat.label}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-secondary/30 px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeUp} transition={{ duration: 0.8 }} className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="outline">How it works</Badge>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Clear rules. Verifiable execution.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">Three steps move funds from intent to deterministic settlement.</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.6, delay: index * 0.14 }}
                  whileHover={{ y: -5, boxShadow: "0 18px 48px rgba(59, 74, 187, 0.15)" }}
                  className="rounded-xl"
                >
                  <Card className="h-full">
                    <CardHeader>
                      <motion.div
                        whileHover={{ rotate: index % 2 === 0 ? 5 : -5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 16 }}
                        className="mb-5 flex size-11 items-center justify-center rounded-xl bg-secondary text-primary"
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </motion.div>
                      <Badge variant="outline">{feature.step}</Badge>
                      <CardTitle className="mt-3 text-2xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-7 text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Separator />
          <div className="flex flex-col gap-4 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="font-heading text-lg font-semibold text-foreground">PriceGate</p>
            <p>Built on Stellar and Reflector Oracle.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
