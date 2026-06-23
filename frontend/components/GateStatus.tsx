"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GateStatus() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Gate status</CardTitle>
        <CardDescription>On-chain status retrieval is not connected yet.</CardDescription>
        <Badge variant="outline">Pending integration</Badge>
      </CardHeader>
    </Card>
  );
}
