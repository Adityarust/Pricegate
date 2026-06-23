"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LockKeyholeIcon, MenuIcon } from "lucide-react";

import WalletConnect from "@/components/WalletConnect";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Escrows", href: "/escrows" },
  { label: "Get Started", href: "/escrow/create" },
];

export default function PremiumNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/75 backdrop-blur-md"
      )}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Primary navigation">
        <motion.a
          href="/"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LockKeyholeIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight">PriceGate</span>
        </motion.a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <WalletConnect />
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open navigation" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>PriceGate</SheetTitle>
                <SheetDescription>Conditional escrow on Stellar.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4 pb-4">
                {links.map((link) => (
                  <SheetClose key={link.href} render={<a href={link.href} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted" />}>
                    {link.label}
                  </SheetClose>
                ))}
                <div className="pt-2">
                  <WalletConnect />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
