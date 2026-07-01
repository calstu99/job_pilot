import { JOBS_PAGE_SIZE } from "@/lib/job-list";

function getPageItems(page: number, pageCount: number): Array<number | "..."> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sortedPages = [...pages]
    .filter((item) => item >= 1 && item <= pageCount)
    .toSorted((first, second) => first - second);
  const items: Array<number | "..."> = [];

  sortedPages.forEach((item, index) => {
    const previous = sortedPages[index - 1];

    if (previous && item - previous > 1) {
      items.push("...");
    }

    items.push(item);
  });

  return items;
}

export function JobsPagination({
  onPageChange,
  page,
  pageCount,
  totalCount,
}: {
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
  totalCount: number;
}): React.ReactNode {
  const start = totalCount > 0 ? (page - 1) * JOBS_PAGE_SIZE + 1 : 0;
  const end = Math.min(page * JOBS_PAGE_SIZE, totalCount);
  const pageItems = getPageItems(page, pageCount);

  return (
    <nav
      aria-label="Job results pagination"
      className="flex flex-col gap-5 border-t border-border bg-surface-secondary px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-[14px] font-normal leading-5 text-text-secondary">
        Showing{" "}
        <strong className="font-semibold text-text-primary">
          {start}
        </strong>{" "}
        to <strong className="font-semibold text-text-primary">{end}</strong> of{" "}
        <strong className="font-semibold text-text-primary">{totalCount}</strong>{" "}
        results
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-11 rounded-lg border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-muted shadow-sm disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pageItems.map((item, index) =>
          item === "..." ? (
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center text-[14px] text-text-muted"
              key={`ellipsis-${index}`}
            >
              …
            </span>
          ) : (
            <button
              aria-current={item === page ? "page" : undefined}
              className={
                item === page
                  ? "grid size-11 place-items-center rounded-lg border border-accent-light bg-accent-muted text-[14px] font-semibold leading-5 text-accent shadow-sm"
                  : "grid size-11 place-items-center rounded-lg border border-border bg-surface text-[14px] font-medium leading-5 text-text-primary shadow-sm hover:bg-surface-secondary"
              }
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {item}
            </button>
          ),
        )}
        <button
          disabled={pageCount === 0 || page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          type="button"
          className="h-11 rounded-lg border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-muted shadow-sm disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
