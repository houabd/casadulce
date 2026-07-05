import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import SessionProvider from "@/components/admin/SessionProvider";
import OrderNotifications from "@/components/admin/OrderNotifications";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-cream-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <OrderNotifications />
    </SessionProvider>
  );
}
