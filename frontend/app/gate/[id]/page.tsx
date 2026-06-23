import { redirect } from "next/navigation";

export default async function GateRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/escrows/${id}`);
}
