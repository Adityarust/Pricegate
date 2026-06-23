"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface GateStatusProps {
  loading?: boolean;
  error?: string | null;
  status?: string | null;
}

export default function GateStatus({ loading = false, error = null, status = null }: GateStatusProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Escrow status</CardTitle>
        <CardDescription>On-chain status retrieval is not connected yet.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Escrow status unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Badge variant="outline">{status ?? "Pending integration"}</Badge>
        )}
      </CardContent>
    </Card>
  );
}
