import type { JobDetails } from "@/lib/jobs";

export function JobDescription({ job }: { job: JobDetails }): React.ReactNode {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
      <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
        <span className="mr-3 inline-grid size-8 place-items-center rounded-full bg-surface-secondary text-text-muted">
          ▤
        </span>
        Job Description
      </h2>
      <p className="mt-6 whitespace-pre-line text-[14px] font-medium leading-6 text-text-primary sm:text-[16px]">
        {job.aboutRole ??
          "No job description preview is available for this listing."}
      </p>
      {job.applyUrl ? (
        <div className="mt-6 border-t border-border pt-5">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-md border border-border bg-surface px-4 py-2 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View full job description ↗
          </a>
          <p className="mt-2 text-[12px] font-normal leading-4 text-text-muted">
            Opens the original job listing in a new tab.
          </p>
        </div>
      ) : null}
    </section>
  );
}
