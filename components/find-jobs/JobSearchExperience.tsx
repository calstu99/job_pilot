"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import type {
  JobListQuery,
  JobSort,
  MatchFilter,
  PersistedJobList,
} from "@/lib/job-list";
import type {
  JobSearchErrorResponse,
  JobSearchResponse,
  JobSearchSummary,
} from "@/lib/job-discovery";

function createJobListUrl(
  query: JobListQuery,
  overrides: Partial<JobListQuery>,
): string {
  const nextQuery = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (nextQuery.filterText) {
    params.set("q", nextQuery.filterText);
  }

  if (nextQuery.matchFilter !== "all") {
    params.set("match", nextQuery.matchFilter);
  }

  if (nextQuery.sort !== "score") {
    params.set("sort", nextQuery.sort);
  }

  if (nextQuery.page > 1) {
    params.set("page", String(nextQuery.page));
  }

  const queryString = params.toString();

  return queryString ? `/find-jobs?${queryString}` : "/find-jobs";
}

export function JobSearchExperience({
  jobList,
  query,
}: {
  jobList: PersistedJobList;
  query: JobListQuery;
}): React.ReactNode {
  const router = useRouter();
  const [error, setError] = useState<JobSearchErrorResponse | null>(null);
  const filterTextRef = useRef(query.filterText);
  const filterTimeoutRef = useRef<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdatingList, startListTransition] = useTransition();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState<JobSearchSummary | null>(null);

  const hasActiveFilters =
    query.filterText.length > 0 || query.matchFilter !== "all";

  useEffect(() => {
    filterTextRef.current = query.filterText;
  }, [query.filterText]);

  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current !== null) {
        window.clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  function updateList(overrides: Partial<JobListQuery>): void {
    if (filterTimeoutRef.current !== null) {
      window.clearTimeout(filterTimeoutRef.current);
      filterTimeoutRef.current = null;
    }

    startListTransition(() => {
      router.replace(
        createJobListUrl(query, {
          filterText: filterTextRef.current.trim(),
          ...overrides,
        }),
        { scroll: false },
      );
    });
  }

  function updateFilterText(value: string): void {
    filterTextRef.current = value;

    if (filterTimeoutRef.current !== null) {
      window.clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = window.setTimeout(() => {
      updateList({ filterText: value.trim(), page: 1 });
      filterTimeoutRef.current = null;
    }, 350);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (isSearching || jobTitle.trim().length < 2) {
      return;
    }

    setError(null);
    setIsSearching(true);
    setSummary(null);

    try {
      const response = await fetch("/api/agent/find", {
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          location: location.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as JobSearchResponse;

      if (!response.ok || !result.success) {
        setError(
          result.success
            ? {
                code: "SEARCH_FAILED",
                error: "We could not finish this job search. Please try again.",
                success: false,
              }
            : result,
        );
        return;
      }

      setSummary(result.data.summary);

      if (query.page > 1) {
        updateList({ page: 1 });
      } else {
        router.refresh();
      }
    } catch (requestError) {
      console.error("[components/find-jobs] search request", requestError);
      setError({
        code: "SEARCH_FAILED",
        error: "We could not finish this job search. Please try again.",
        success: false,
      });
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <>
      <SearchControls
        error={error}
        isSearching={isSearching}
        jobTitle={jobTitle}
        location={location}
        onJobTitleChange={setJobTitle}
        onLocationChange={setLocation}
        onSubmit={handleSubmit}
        summary={summary}
      />
      <JobFilters
        filterText={query.filterText}
        key={query.filterText}
        matchFilter={query.matchFilter}
        onFilterTextChange={updateFilterText}
        onMatchFilterChange={(matchFilter: MatchFilter) =>
          updateList({ matchFilter, page: 1 })
        }
        onSortChange={(sort: JobSort) => updateList({ page: 1, sort })}
        sort={query.sort}
      />
      <section
        aria-busy={isUpdatingList}
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
      >
        <JobsTable
          emptyMessage={
            jobList.error
              ? "We could not retrieve your saved jobs. Refresh the page to try again."
              : hasActiveFilters
              ? "Adjust the company, role, or match filter to see more results."
              : undefined
          }
          emptyTitle={
            jobList.error
              ? "Unable to load jobs"
              : hasActiveFilters
              ? "No jobs match these filters"
              : undefined
          }
          jobs={jobList.jobs}
        />
        <JobsPagination
          onPageChange={(page) => updateList({ page })}
          page={jobList.page}
          pageCount={jobList.pageCount}
          totalCount={jobList.totalCount}
        />
      </section>
    </>
  );
}
