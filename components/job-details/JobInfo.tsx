import type { JobDetails } from "@/lib/jobs";

function formatJobType(value: JobDetails["jobType"]): string {
  return value === "fulltime"
    ? "Full-time"
    : value === "parttime"
      ? "Part-time"
      : value === "contract"
        ? "Contract"
        : "Not listed";
}

function formatDateFound(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function JobInfo({ job }: { job: JobDetails }): React.ReactNode {
  const items = [
    { label: "Salary Est.", value: job.salary ?? "Not listed", tone: "bg-success-lightest text-success", symbol: "$" },
    { label: "Location", value: job.location ?? "Not listed", tone: "bg-info-lightest text-info-medium", symbol: "⌖" },
    { label: "Job Type", value: formatJobType(job.jobType), tone: "bg-accent-muted text-accent", symbol: "▣" },
    { label: "Date Found", value: formatDateFound(job.foundAt), tone: "bg-surface-secondary text-text-secondary", symbol: "□" },
  ];

  return (
    <>
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-xl border border-border bg-surface-secondary text-[26px] text-text-muted">▥</span>
            <div className="min-w-0">
              <h1 className="text-[24px] font-semibold leading-8 text-text-primary sm:text-[28px] sm:leading-9">{job.title}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] font-medium leading-5 text-text-secondary">
                <span>{job.company}</span>
                {job.matchScore !== null ? (
                  <>
                    <span aria-hidden="true">•</span>
                    <span className="rounded-full bg-success-lightest px-3 py-1 text-[12px] font-medium leading-4 text-success-foreground">{job.matchScore}% Match Score</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          {job.applyUrl ? (
            <a href={job.applyUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              ↗ View Job Post
            </a>
          ) : null}
        </div>
      </section>
      <section aria-label="Job summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl text-[20px] ${item.tone}`}>{item.symbol}</span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold leading-5 text-text-primary" title={item.value}>{item.value}</p>
              <p className="mt-1 text-[12px] font-medium uppercase leading-4 tracking-wide text-text-muted">{item.label}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
