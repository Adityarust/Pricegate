"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePriceFeed } from "@/lib/hooks/usePriceFeed";

export default function PriceTicker() {
  const { price, loading, error } = usePriceFeed();

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>XLM/USD</CardTitle>
        <CardDescription>Current reference price</CardDescription>
        <Badge variant="secondary">
          {loading ? "Loading" : error || price === null ? "Unavailable" : `$${price.toFixed(4)}`}
        </Badge>
      </CardHeader>
    </Card>
  );
}
