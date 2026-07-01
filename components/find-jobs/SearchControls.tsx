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

export function SearchControls(): React.ReactNode {
  return (
    <section
      aria-labelledby="job-search-heading"
      className="rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <h1 id="job-search-heading" className="sr-only">
        Find jobs
      </h1>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-dark">
            Job title
          </span>
          <span className="flex h-12 items-center gap-3 rounded-lg border border-border bg-surface px-4 shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
            <SearchIcon className="size-5 shrink-0 text-text-muted" />
            <input
              type="text"
              placeholder="Frontend Engineer"
              className="min-w-0 flex-1 bg-transparent text-[16px] font-normal leading-6 text-text-primary outline-none placeholder:text-text-muted"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-dark">
            Location
          </span>
          <input
            type="text"
            placeholder="Remote, New York..."
            className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-[16px] font-normal leading-6 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <button
          type="button"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-7 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm"
        >
          <SearchIcon />
          Find Jobs
        </button>
      </div>

      <div
        role="status"
        className="mt-5 flex items-center gap-3 rounded-lg border border-success-light bg-success-lightest px-4 py-3 text-[14px] font-medium leading-5 text-success-dark"
      >
        <SparkleIcon />
        <span>Found 8 jobs and saved 4 strong matches.</span>
      </div>
    </section>
  );
}
