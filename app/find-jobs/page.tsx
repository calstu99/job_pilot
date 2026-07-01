import { JobSearchExperience } from "@/components/find-jobs/JobSearchExperience";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import {
  parseJobListQuery,
  type JobListSearchParams,
} from "@/lib/job-list";
import {
  createInsforgeServer,
  requireUser,
} from "@/lib/insforge-server";
import { loadPersistedJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function FindJobsPage({
  searchParams,
}: {
  searchParams: Promise<JobListSearchParams>;
}): Promise<React.ReactNode> {
  const [user, resolvedSearchParams] = await Promise.all([
    requireUser(),
    searchParams,
  ]);
  const query = parseJobListQuery(resolvedSearchParams);
  const insforge = await createInsforgeServer();
  const jobList = await loadPersistedJobs({
    insforge,
    query,
    userId: user.id,
  });

  return (
    <main className="min-h-screen bg-background">
      <ProtectedHeader activePage="find-jobs" />
      <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8 sm:px-8 lg:py-12">
        <JobSearchExperience jobList={jobList} query={query} />
      </div>
    </main>
  );
}
