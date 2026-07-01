export type JobSearchResult = {
  company: string;
  dateFound: string;
  id: string;
  role: string;
  salary: string | null;
  score: number;
};

export type JobSearchSummary = {
  found: number;
  saved: number;
  skippedDuplicates: number;
  skippedFailures: number;
  strongMatches: number;
};

export type JobSearchSuccessResponse = {
  data: {
    jobs: JobSearchResult[];
    summary: JobSearchSummary;
  };
  success: true;
};

export type JobSearchErrorResponse = {
  code?:
    | "INCOMPLETE_PROFILE"
    | "INVALID_REQUEST"
    | "SEARCH_FAILED"
    | "UNAUTHENTICATED";
  error: string;
  success: false;
};

export type JobSearchResponse =
  | JobSearchErrorResponse
  | JobSearchSuccessResponse;
