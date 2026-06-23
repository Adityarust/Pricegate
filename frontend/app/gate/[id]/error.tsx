"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Alert variant="destructive">
        <AlertTitle>Could not load escrow details</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>{error.message || "The escrow view failed to load."}</span>
          <Button variant="outline" onClick={reset} className="w-fit">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </section>
  );
}
