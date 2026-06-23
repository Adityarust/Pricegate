import { redirect } from "next/navigation";

export default function GateCreateRedirect() {
  redirect("/escrow/create");
}
