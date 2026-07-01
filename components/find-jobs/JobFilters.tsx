function SearchIcon(): React.ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
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

export function JobFilters(): React.ReactNode {
  return (
    <section
      aria-label="Job list filters"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center"
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 text-text-muted">
        <SearchIcon />
        <span className="sr-only">Filter jobs</span>
        <input
          type="search"
          placeholder="Filter by company or role..."
          className="min-w-0 flex-1 bg-transparent text-[16px] font-normal leading-6 text-text-primary outline-none placeholder:text-text-muted"
        />
      </label>

      <div className="hidden h-10 w-px bg-border md:block" />

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="sr-only">Match filter</span>
          <select
            defaultValue="all"
            className="h-11 w-full cursor-pointer rounded-lg border border-border bg-surface px-4 pr-10 text-[14px] font-medium leading-5 text-text-primary shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-40"
          >
            <option value="all">All Matches</option>
            <option value="high">High Match</option>
            <option value="low">Low Match</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Sort jobs</span>
          <select
            defaultValue="score"
            className="h-11 w-full cursor-pointer rounded-lg border border-border bg-surface px-4 pr-10 text-[14px] font-medium leading-5 text-text-dark shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-40"
          >
            <option value="score">Match Score</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>
    </section>
  );
}
