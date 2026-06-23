import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-20 lg:px-8 lg:py-28">
      <div className="flex flex-col items-center gap-6 text-center">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-14 w-full max-w-4xl" />
        <Skeleton className="h-14 w-full max-w-3xl" />
        <Skeleton className="h-6 w-full max-w-2xl" />
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Skeleton className="h-12 w-full sm:w-44" />
          <Skeleton className="h-12 w-full sm:w-44" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
