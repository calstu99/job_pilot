import Link from "next/link";
import type { JobSearchResult } from "@/lib/job-discovery";

type MatchTone = "high" | "medium" | "low";

const matchToneClasses: Record<MatchTone, string> = {
  high: "bg-success",
  low: "bg-warning",
  medium: "bg-info-medium",
};

function getMatchTone(score: number): MatchTone {
  if (score >= 90) {
    return "high";
  }

  if (score >= 80) {
    return "medium";
  }

  return "low";
}

function formatDateFound(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CompanyIcon(): React.ReactNode {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-secondary text-text-secondary">
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 20V9.5h6V20M11 20V4h8v16M3 20h18M7.5 12h1M7.5 15h1M14 8h2M14 11h2M14 14h2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    </span>
  );
}

function MatchScore({
  score,
  tone,
}: {
  score: number;
  tone: MatchTone;
}): React.ReactNode {
  return (
    <div
      aria-label={`${score}% match`}
      className="flex min-w-52 items-center gap-3"
    >
      <span className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
        <span
          className={`block h-full rounded-full ${matchToneClasses[tone]}`}
          style={{ width: `${score}%` }}
        />
      </span>
      <span className="text-[16px] font-semibold leading-6 text-text-dark">
        {score}%
      </span>
    </div>
  );
}

export function JobsTable({
  emptyMessage = "Enter a role and optional location above to discover and score new opportunities.",
  emptyTitle = "Your job matches will appear here",
  jobs,
}: {
  emptyMessage?: string;
  emptyTitle?: string;
  jobs: JobSearchResult[];
}): React.ReactNode {
  if (jobs.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <span className="mx-auto block w-fit text-text-muted">
          <CompanyIcon />
        </span>
        <h2 className="mt-4 text-[18px] font-semibold leading-7 text-text-primary">
          {emptyTitle}
        </h2>
        <p className="mx-auto mt-1 max-w-md text-[14px] font-normal leading-5 text-text-secondary">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead className="bg-surface-secondary">
          <tr className="border-b border-border">
            {["Company", "Role", "Match Score", "Salary Est.", "Date Found"].map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-8 py-5 text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-secondary"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-b border-border bg-surface transition-colors last:border-b-0 hover:bg-surface-secondary"
            >
              <td>
                <Link
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.role} at ${job.company}`}
                  className="flex items-center gap-4 px-8 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  <CompanyIcon />
                  <span className="text-[16px] font-semibold leading-6 text-text-primary">
                    {job.company}
                  </span>
                </Link>
              </td>
              <td>
                <Link
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.role} at ${job.company}`}
                  className="block px-8 py-5 text-[16px] font-medium leading-6 text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  {job.role}
                </Link>
              </td>
              <td>
                <Link
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.role} at ${job.company}`}
                  className="block px-8 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  <MatchScore score={job.score} tone={getMatchTone(job.score)} />
                </Link>
              </td>
              <td>
                <Link
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.role} at ${job.company}`}
                  className="block whitespace-nowrap px-8 py-5 text-[16px] font-normal leading-6 text-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  {job.salary ?? "Not listed"}
                </Link>
              </td>
              <td>
                <Link
                  href={`/find-jobs/${job.id}`}
                  aria-label={`View ${job.role} at ${job.company}`}
                  className="block whitespace-nowrap px-8 py-5 text-[16px] font-normal leading-6 text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                >
                  {formatDateFound(job.dateFound)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
