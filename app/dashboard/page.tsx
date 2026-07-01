import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import { requireUser } from "@/lib/insforge-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.ReactNode> {
  await requireUser();

  return (
    <main className="min-h-screen bg-background">
      <ProtectedHeader activePage="dashboard" />
      <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-10 lg:px-20">
        <h1 className="sr-only">Dashboard</h1>
        <DashboardOverview />
      </div>
    </main>
  );
}
