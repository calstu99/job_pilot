import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import { createInsforgeServer, requireUser } from "@/lib/insforge-server";
import { loadPersistedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({
  params,
}: PageProps<"/find-jobs/[id]">): Promise<React.ReactNode> {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  const insforge = await createInsforgeServer();
  const result = await loadPersistedJob({ id, insforge, userId: user.id });

  if (!result.error && !result.job) notFound();

  return (
    <main className="min-h-screen bg-background">
      <ProtectedHeader activePage="find-jobs" />
      <div className="mx-auto max-w-[936px] px-6 py-8 sm:px-8 lg:py-10">
        <Link href="/find-jobs" className="inline-flex items-center gap-2 text-[14px] font-medium leading-5 text-text-secondary transition hover:text-text-primary">‹ Back to Jobs</Link>
        {result.error || !result.job ? (
          <section className="mt-8 rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
            <h1 className="text-[18px] font-semibold leading-7 text-text-primary">We couldn&apos;t load this job</h1>
            <p className="mt-2 text-[14px] font-normal leading-5 text-text-secondary">Please return to your jobs and try again.</p>
          </section>
        ) : (
          <div className="mt-8 space-y-6">
            <JobInfo job={result.job} />
            <MatchScore job={result.job} />
            <JobDescription job={result.job} />
            <CompanyResearch
              company={result.job.company}
              initialDossier={result.job.companyResearch}
              jobId={result.job.id}
            />
            <JobActions applyUrl={result.job.applyUrl} company={result.job.company} />
          </div>
        )}
      </div>
    </main>
  );
}
