import type { Metadata } from "next";
import "./globals.css";
import WalletConnect from "@/components/WalletConnect";

export const metadata: Metadata = {
  title: "PriceGate — Conditional XLM Escrow on Stellar",
  description:
    "Lock XLM in a smart escrow that releases funds when price conditions are met. Built on Soroban with Reflector oracle integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-grid">
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 border-b border-surface-border bg-[#09090f]/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <svg
                  className="w-4 h-4 text-accent-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight">
                Price<span className="text-accent-light">Gate</span>
              </span>
            </a>

            <WalletConnect />
          </div>
        </nav>

        {/* Page content */}
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
