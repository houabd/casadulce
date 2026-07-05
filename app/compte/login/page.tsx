import { getCustomerSession } from "@/lib/customer-session";
import { redirect } from "next/navigation";
import LoginForm from "@/components/compte/LoginForm";

export default async function LoginPage() {
  const session = await getCustomerSession();
  if (session) redirect("/compte/mes-commandes");

  return <LoginForm />;
}
