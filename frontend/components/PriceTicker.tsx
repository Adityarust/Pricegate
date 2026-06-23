"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { usePriceFeed } from "@/lib/hooks/usePriceFeed";

export default function PriceTicker() {
  const { price, loading, refreshing, error } = usePriceFeed();

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>XLM/USD</CardTitle>
        <CardDescription>Current reference price</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28" />
            <Spinner />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Price unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{price === null ? "Unavailable" : `$${price.toFixed(4)}`}</Badge>
            {refreshing && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner />
                Refreshing
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
