import Link from "next/link";
import type { FormEvent } from "react";
import type {
  JobSearchErrorResponse,
  JobSearchSummary,
} from "@/lib/job-discovery";

function SearchIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16.25 16.25 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SparkleIcon(): React.ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3.5c.65 4.6 2.4 6.35 7 7-4.6.65-6.35 2.4-7 7-.65-4.6-2.4-6.35-7-7 4.6-.65 6.35-2.4 7-7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M19 3v4M17 5h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function StatusIcon({
  tone,
}: {
  tone: "error" | "success";
}): React.ReactNode {
  if (tone === "error") {
    return (
      <svg
        aria-hidden="true"
        className="size-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 7.5v5.25M12 16.25h.01"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return <SparkleIcon />;
}

type SearchControlsProps = {
  error: JobSearchErrorResponse | null;
  isSearching: boolean;
  jobTitle: string;
  location: string;
  onJobTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  summary: JobSearchSummary | null;
};

function getSummaryMessage(summary: JobSearchSummary): string {
  if (summary.found === 0) {
    return "No jobs found. Try a broader title or location.";
  }

  const savedLabel = summary.saved === 1 ? "job" : "jobs";
  const strongLabel =
    summary.strongMatches === 1 ? "strong match" : "strong matches";
  const details = [
    summary.skippedDuplicates > 0
      ? `${summary.skippedDuplicates} duplicate${summary.skippedDuplicates === 1 ? "" : "s"} skipped`
      : null,
    summary.skippedFailures > 0
      ? `${summary.skippedFailures} could not be scored or saved`
      : null,
  ].filter(Boolean);

  return `Found ${summary.found} jobs and saved ${summary.saved} ${savedLabel}, including ${summary.strongMatches} ${strongLabel}.${details.length > 0 ? ` ${details.join("; ")}.` : ""}`;
}

export function SearchControls({
  error,
  isSearching,
  jobTitle,
  location,
  onJobTitleChange,
  onLocationChange,
  onSubmit,
  summary,
}: SearchControlsProps): React.ReactNode {
  return (
    <section
      aria-labelledby="job-search-heading"
      className="rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <h1 id="job-search-heading" className="sr-only">
        Find jobs
      </h1>
      <form
        onSubmit={onSubmit}
        className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
      >
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-dark">
            Job title
          </span>
          <span className="flex h-12 items-center gap-3 rounded-lg border border-border bg-surface px-4 shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <SearchIcon className="size-5 shrink-0 text-text-muted" />
            <input
              autoComplete="off"
              disabled={isSearching}
              maxLength={120}
              name="jobTitle"
              onChange={(event) => onJobTitleChange(event.target.value)}
              required
              type="text"
              value={jobTitle}
              placeholder="Frontend Engineer"
              className="min-w-0 flex-1 bg-transparent text-[16px] font-normal leading-6 text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-dark">
            Location
          </span>
          <input
            autoComplete="off"
            disabled={isSearching}
            maxLength={120}
            name="location"
            onChange={(event) => onLocationChange(event.target.value)}
            type="text"
            value={location}
            placeholder="Remote, New York..."
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-[16px] font-normal leading-6 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary"
          />
        </label>

        <button
          disabled={isSearching}
          type="submit"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-7 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSearching ? (
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-2 border-accent-foreground border-r-accent"
            />
          ) : (
            <SearchIcon />
          )}
          {isSearching ? "Finding Jobs..." : "Find Jobs"}
        </button>
      </form>

      {summary ? (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-lg border border-success-light bg-success-lightest px-4 py-3 text-[14px] font-medium leading-5 text-success-dark"
        >
          <StatusIcon tone="success" />
          <span>{getSummaryMessage(summary)}</span>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-lg border border-warning bg-accent-muted px-4 py-3 text-[14px] font-medium leading-5 text-text-dark"
        >
          <StatusIcon tone="error" />
          <span>
            {error.error}{" "}
            {error.code === "INCOMPLETE_PROFILE" ? (
              <Link
                href="/profile"
                className="font-semibold underline underline-offset-2"
              >
                Complete profile
              </Link>
            ) : null}
          </span>
        </div>
      ) : null}
    </section>
  );
}
