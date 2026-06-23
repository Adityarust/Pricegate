"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
      <Alert variant="destructive">
        <AlertTitle>Could not load the create flow</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>{error.message || "The page failed to initialize."}</span>
          <Button variant="outline" onClick={reset} className="w-fit">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </section>
  );
}
