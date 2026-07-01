import type { JobSearchResult } from "@/lib/job-discovery";

export const JOBS_PAGE_SIZE = 20;

export type MatchFilter = "all" | "high" | "low";
export type JobSort = "newest" | "oldest" | "score";

export type JobListQuery = {
  filterText: string;
  matchFilter: MatchFilter;
  page: number;
  sort: JobSort;
};

export type PersistedJobList = {
  error: boolean;
  jobs: JobSearchResult[];
  page: number;
  pageCount: number;
  totalCount: number;
};

export type JobListSearchParams = Record<
  string,
  string | string[] | undefined
>;

function readSingle(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export function parseJobListQuery(
  searchParams: JobListSearchParams,
): JobListQuery {
  const rawFilter = readSingle(searchParams.q).trim().slice(0, 120);
  const rawMatch = readSingle(searchParams.match);
  const rawPage = Number.parseInt(readSingle(searchParams.page), 10);
  const rawSort = readSingle(searchParams.sort);

  return {
    filterText: rawFilter,
    matchFilter:
      rawMatch === "high" || rawMatch === "low" ? rawMatch : "all",
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    sort:
      rawSort === "newest" || rawSort === "oldest" ? rawSort : "score",
  };
}

