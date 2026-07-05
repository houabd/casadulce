import { getCustomerSession } from "@/lib/customer-session";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/compte/RegisterForm";

export default async function RegisterPage() {
  const session = await getCustomerSession();
  if (session) redirect("/compte/mes-commandes");

  return <RegisterForm />;
}
