"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-5 py-20 lg:px-8">
      <Alert variant="destructive" className="w-full">
        <AlertTitle>Something failed to load</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>{error.message || "An unexpected error occurred."}</span>
          <Button variant="outline" onClick={reset} className="w-fit">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
