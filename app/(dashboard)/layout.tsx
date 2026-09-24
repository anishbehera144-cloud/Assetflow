export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <Sidebar />
      <Topbar />

      <main className="lg:ml-[260px]">
        {children}
      </main>
    </div>
  );
}