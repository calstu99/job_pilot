import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import { requireUser } from "@/lib/insforge-server";

export const dynamic = "force-dynamic";

export default async function FindJobsPage(): Promise<React.ReactNode> {
  await requireUser();

  return (
    <main className="min-h-screen bg-background">
      <ProtectedHeader activePage="find-jobs" />
      <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8 sm:px-8 lg:py-12">
        <SearchControls />
        <JobFilters />
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <JobsTable />
          <JobsPagination />
        </section>
      </div>
    </main>
  );
}
