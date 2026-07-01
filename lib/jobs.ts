import "server-only";

import { companyResearchDossierSchema } from "@/agent/research";
import type { CompanyResearchDossier } from "@/agent/types";
import type { InsforgeServerClient } from "@/lib/insforge-server";
import {
  JOBS_PAGE_SIZE,
  type JobListQuery,
  type PersistedJobList,
} from "@/lib/job-list";
import { MATCH_THRESHOLD } from "@/lib/utils";

const jobListSelect = [
  "company",
  "company_research",
  "found_at",
  "id",
  "match_score",
  "salary",
  "title",
].join(",");

const jobDetailsSelect = [
  "about_role",
  "company",
  "external_apply_url",
  "found_at",
  "id",
  "job_type",
  "location",
  "match_reason",
  "match_score",
  "matched_skills",
  "missing_skills",
  "salary",
  "title",
].join(",");

export type JobDetails = {
  aboutRole: string | null;
  applyUrl: string | null;
  company: string;
  companyResearch: CompanyResearchDossier | null;
  foundAt: string;
  id: string;
  jobType: "contract" | "fulltime" | "parttime" | null;
  location: string | null;
  matchReason: string | null;
  matchScore: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  salary: string | null;
  title: string;
};

export type JobDetailsResult = {
  error: boolean;
  job: JobDetails | null;
};

type PersistedJobRow = {
  company: unknown;
  found_at: unknown;
  id: unknown;
  match_score: unknown;
  salary: unknown;
  title: unknown;
};

function quotePostgrestValue(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function normalizeRows(value: unknown): PersistedJobList["jobs"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const row = item as PersistedJobRow;

    if (
      typeof row.id !== "string" ||
      typeof row.company !== "string" ||
      typeof row.title !== "string" ||
      typeof row.match_score !== "number" ||
      typeof row.found_at !== "string"
    ) {
      return [];
    }

    return [
      {
        company: row.company,
        dateFound: row.found_at,
        id: row.id,
        role: row.title,
        salary: typeof row.salary === "string" ? row.salary : null,
        score: row.match_score,
      },
    ];
  });
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeJobDetails(value: unknown): JobDetails | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const row = Object.fromEntries(Object.entries(value));

  if (
    typeof row.id !== "string" ||
    typeof row.company !== "string" ||
    typeof row.title !== "string" ||
    typeof row.found_at !== "string"
  ) {
    return null;
  }

  const jobType =
    row.job_type === "contract" ||
    row.job_type === "fulltime" ||
    row.job_type === "parttime"
      ? row.job_type
      : null;

  return {
    aboutRole: typeof row.about_role === "string" ? row.about_role : null,
    applyUrl:
      typeof row.external_apply_url === "string"
        ? row.external_apply_url
        : null,
    company: row.company,
    companyResearch:
      companyResearchDossierSchema.safeParse(row.company_research).data ?? null,
    foundAt: row.found_at,
    id: row.id,
    jobType,
    location: typeof row.location === "string" ? row.location : null,
    matchReason:
      typeof row.match_reason === "string" ? row.match_reason : null,
    matchScore:
      typeof row.match_score === "number" ? row.match_score : null,
    matchedSkills: normalizeStringArray(row.matched_skills),
    missingSkills: normalizeStringArray(row.missing_skills),
    salary: typeof row.salary === "string" ? row.salary : null,
    title: row.title,
  };
}

function buildQuery(
  insforge: InsforgeServerClient,
  userId: string,
  query: JobListQuery,
  page: number,
) {
  const from = (page - 1) * JOBS_PAGE_SIZE;
  let request = insforge.database
    .from("jobs")
    .select(jobListSelect, { count: "exact" })
    .eq("user_id", userId);

  if (query.matchFilter === "high") {
    request = request.gte("match_score", MATCH_THRESHOLD);
  } else if (query.matchFilter === "low") {
    request = request.lt("match_score", MATCH_THRESHOLD);
  }

  if (query.filterText) {
    const pattern = quotePostgrestValue(`*${query.filterText}*`);
    request = request.or(`company.ilike.${pattern},title.ilike.${pattern}`);
  }

  if (query.sort === "newest") {
    request = request.order("found_at", { ascending: false });
  } else if (query.sort === "oldest") {
    request = request.order("found_at", { ascending: true });
  } else {
    request = request
      .order("match_score", { ascending: false, nullsFirst: false })
      .order("found_at", { ascending: false });
  }

  return request
    .order("id", { ascending: true })
    .range(from, from + JOBS_PAGE_SIZE - 1);
}

export async function loadPersistedJobs({
  insforge,
  query,
  userId,
}: {
  insforge: InsforgeServerClient;
  query: JobListQuery;
  userId: string;
}): Promise<PersistedJobList> {
  const firstResult = await buildQuery(insforge, userId, query, query.page);

  if (firstResult.error) {
    console.error("[lib/jobs] load persisted jobs", firstResult.error);
    return {
      error: true,
      jobs: [],
      page: 1,
      pageCount: 0,
      totalCount: 0,
    };
  }

  const totalCount = firstResult.count ?? 0;
  const pageCount =
    totalCount === 0 ? 0 : Math.ceil(totalCount / JOBS_PAGE_SIZE);
  const page = pageCount === 0 ? 1 : Math.min(query.page, pageCount);

  if (page !== query.page) {
    const clampedResult = await buildQuery(insforge, userId, query, page);

    if (clampedResult.error) {
      console.error(
        "[lib/jobs] load clamped persisted jobs",
        clampedResult.error,
      );
      return {
        error: true,
        jobs: [],
        page,
        pageCount,
        totalCount,
      };
    }

    return {
      error: false,
      jobs: normalizeRows(clampedResult.data),
      page,
      pageCount,
      totalCount,
    };
  }

  return {
    error: false,
    jobs: normalizeRows(firstResult.data),
    page,
    pageCount,
    totalCount,
  };
}

export async function loadPersistedJob({
  id,
  insforge,
  userId,
}: {
  id: string;
  insforge: InsforgeServerClient;
  userId: string;
}): Promise<JobDetailsResult> {
  const result = await insforge.database
    .from("jobs")
    .select(jobDetailsSelect)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error) {
    console.error("[lib/jobs] load persisted job", result.error);
    return { error: true, job: null };
  }

  return {
    error: false,
    job: normalizeJobDetails(result.data),
  };
}
