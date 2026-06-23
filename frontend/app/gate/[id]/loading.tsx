import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-44" />
        </CardContent>
      </Card>
    </section>
  );
}
