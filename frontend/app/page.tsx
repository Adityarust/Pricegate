"use client";

import { usePriceFeed } from "@/lib/hooks/usePriceFeed";
import BoidsEcosystem from "@/components/BoidsEcosystem";

export default function Home() {
  const { price, loading: priceLoading } = usePriceFeed(10000);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Background Boids flocking simulation */}
      <div className="absolute inset-0 z-0">
        <BoidsEcosystem
          count={110}
          background="#09090f"
          palette={["#3b82f6", "#60a5fa", "#c084fc", "#f8fafc", "#1e293b"]}
          cursorRadius={120}
          agentShape="triangle"
          className="h-full w-full !rounded-none opacity-80"
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 sm:py-32 text-center">
        {/* Live price badge */}
        <div className="animate-fade-in mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-gray-400">XLM/USD</span>
            <span className="font-mono font-semibold text-white">
              {priceLoading ? "—" : `$${price.toFixed(4)}`}
            </span>
          </div>
        </div>

        <h1 className="animate-slide-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1]">
          Lock funds. Set conditions.{" "}
          <span className="gradient-text">Let the contract decide.</span>
        </h1>

        <p className="animate-slide-up mt-6 text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed">
          Create price-conditional escrows on Stellar. Your XLM is released
          only when real-time oracle conditions are met.
        </p>

        <div className="animate-slide-up mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a href="#create" className="btn-primary text-base !px-8 !py-3.5 glow">
            Create a Gate
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base !px-8 !py-3.5"
          >
            View on GitHub
          </a>
        </div>

        {/* Stats */}
        <div className="animate-fade-in mt-20 grid grid-cols-3 gap-8 sm:gap-16 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
            <p className="text-sm text-gray-500 mt-1">On-chain</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              &lt;5s
            </p>
            <p className="text-sm text-gray-500 mt-1">Price Updates</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              2
            </p>
            <p className="text-sm text-gray-500 mt-1">Contracts</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-24 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Lock XLM",
              desc: "Deposit XLM into a smart escrow with your price condition and deadline.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              ),
            },
            {
              step: "02",
              title: "Oracle Watches",
              desc: "Reflector oracle provides real-time XLM/USD price data on-chain.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ),
            },
            {
              step: "03",
              title: "Auto Release",
              desc: "When your condition is met, funds are released. If deadline passes, you get a refund.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass-card-hover p-6 sm:p-8 text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <svg
                  className="w-6 h-6 text-accent-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {item.icon}
                </svg>
              </div>
              <div className="text-xs font-mono text-accent mb-2">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8 px-4 text-center text-sm text-gray-500">
        <p>
          Built on{" "}
          <a
            href="https://stellar.org"
            className="text-accent-light hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Stellar
          </a>{" "}
          with{" "}
          <a
            href="https://reflector.network"
            className="text-accent-light hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reflector Oracle
          </a>
        </p>
      </footer>
    </div>
    </div>
  );
}
