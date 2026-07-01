const pageButtonClassName =
  "grid size-11 place-items-center rounded-lg border border-border bg-surface text-[14px] font-medium leading-5 text-text-dark shadow-sm";

export function JobsPagination(): React.ReactNode {
  return (
    <nav
      aria-label="Job results pagination"
      className="flex flex-col gap-5 border-t border-border bg-surface-secondary px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-[14px] font-normal leading-5 text-text-secondary">
        Showing <strong className="font-semibold text-text-primary">1</strong> to{" "}
        <strong className="font-semibold text-text-primary">6</strong> of{" "}
        <strong className="font-semibold text-text-primary">24</strong> results
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled
          className="h-11 rounded-lg border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-muted shadow-sm disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          type="button"
          aria-current="page"
          className="grid size-11 place-items-center rounded-lg border border-accent-light bg-accent-muted text-[14px] font-semibold leading-5 text-accent shadow-sm"
        >
          1
        </button>
        {[2, 3].map((page) => (
          <button key={page} type="button" className={pageButtonClassName}>
            {page}
          </button>
        ))}
        <span className="grid size-11 place-items-center text-[14px] text-text-muted">
          …
        </span>
        <button type="button" className={pageButtonClassName}>
          8
        </button>
        <button
          type="button"
          className="h-11 rounded-lg border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-dark shadow-sm"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
