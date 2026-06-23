import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-5 py-20 lg:px-8">
      <Alert>
        <AlertTitle>Page not found</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>The route you requested does not exist or has moved.</span>
          <Link href="/" className={cn(buttonVariants(), "w-fit")}>
            Return home
          </Link>
        </AlertDescription>
      </Alert>
    </section>
  );
}
