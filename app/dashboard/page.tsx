import { requireAuth } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const user = await requireAuth();

  return <DashboardClient user={user} />;
}

export const dynamic = "force-dynamic";


