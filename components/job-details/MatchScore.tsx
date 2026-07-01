import type { JobDetails } from "@/lib/jobs";

export function MatchScore({ job }: { job: JobDetails }): React.ReactNode {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
        <h2 className="text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-secondary">
          <span className="mr-3 inline-grid size-8 place-items-center rounded-full bg-success-lightest text-success">✣</span>
          AI Match Reasoning
        </h2>
        <p className="mt-4 text-[14px] font-medium leading-6 text-text-primary sm:text-[16px]">{job.matchReason ?? "Match reasoning is not available for this job yet."}</p>
      </section>
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
        <h2 className="text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-secondary">Required Skills vs Your Profile</h2>
        <p className="mt-5 text-[12px] font-medium leading-4 text-text-muted">You have</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {job.matchedSkills.length ? job.matchedSkills.map((skill) => (
            <span key={skill} className="rounded-full bg-success-lightest px-3 py-1 text-[12px] font-medium leading-4 text-success-foreground">✓ {skill}</span>
          )) : <span className="text-[14px] font-normal text-text-muted">No matched skills were identified.</span>}
        </div>
        <p className="mt-4 text-[12px] font-medium leading-4 text-text-muted">Gap skills</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {job.missingSkills.length ? job.missingSkills.map((skill) => (
            <span key={skill} className="rounded-full bg-accent-muted px-3 py-1 text-[12px] font-medium leading-4 text-accent">× {skill}</span>
          )) : <span className="text-[14px] font-normal text-text-muted">No skill gaps were identified.</span>}
        </div>
      </section>
    </div>
  );
}
