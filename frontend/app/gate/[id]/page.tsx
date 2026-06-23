import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Gate #{id}</CardTitle>
          <CardDescription>Escrow status and settlement controls.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Gate detail retrieval is the next integration step.</p>
        </CardContent>
      </Card>
    </section>
  );
}
