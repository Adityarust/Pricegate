import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/playfair-display";
import "./globals.css";

import ExtensionErrorSuppressor from "@/components/ExtensionErrorSuppressor";
import PremiumNav from "@/components/PremiumNav";
import { WalletProvider } from "@/components/WalletConnect";

export const metadata: Metadata = {
  title: "PriceGate — Conditional XLM Escrow on Stellar",
  description:
    "Lock XLM in a smart escrow that releases funds when price conditions are met. Built on Soroban with Reflector oracle integration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <WalletProvider>
          <ExtensionErrorSuppressor />
          <PremiumNav />
          <main>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
