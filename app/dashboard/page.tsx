import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import {
  loadDashboardActivity,
  loadDashboardStats,
} from "@/lib/dashboard";
import {
  createInsforgeServer,
  requireUser,
} from "@/lib/insforge-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.ReactNode> {
  const user = await requireUser();
  const insforge = await createInsforgeServer();
  const [activity, stats] = await Promise.all([
    loadDashboardActivity({ insforge, userId: user.id }),
    loadDashboardStats({ insforge, userId: user.id }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <ProtectedHeader activePage="dashboard" />
      <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-10 lg:px-20">
        <h1 className="sr-only">Dashboard</h1>
        <DashboardOverview activity={activity} stats={stats} />
      </div>
    </main>
  );
}
