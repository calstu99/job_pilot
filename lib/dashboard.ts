import "server-only";

import type { InsforgeServerClient } from "@/lib/insforge-server";

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const ACTIVITY_LIMIT = 5;

export type DashboardActivityItem = {
  color: "info" | "success";
  id: string;
  label: string;
  occurredAt: string;
  time: string;
};

export type DashboardActivity = {
  error: boolean;
  items: DashboardActivityItem[];
};

export type DashboardStats = {
  averageMatchRate: number | null;
  companiesResearched: number | null;
  jobsThisWeek: number | null;
  totalJobs: number | null;
};

type MatchScoreRow = {
  match_score: unknown;
};

type AgentRunRow = {
  completed_at: unknown;
  id: unknown;
  job_title_searched: unknown;
  jobs_found: unknown;
};

type ResearchRow = {
  company: unknown;
  company_researched_at: unknown;
  id: unknown;
};

function logStatsError(stat: string, error: unknown): void {
  console.error(`[lib/dashboard] load ${stat}`, error);
}

function formatRelativeTime(timestamp: string, now: number): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now - new Date(timestamp).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) {
    return "Just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays === 1) {
    return "Yesterday";
  }
  if (elapsedDays < 30) {
    return `${elapsedDays} days ago`;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

function normalizeSearchActivities(
  value: unknown,
  now: number,
): DashboardActivityItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const row = item as AgentRunRow;
    if (
      typeof row.id !== "string" ||
      typeof row.completed_at !== "string" ||
      typeof row.job_title_searched !== "string" ||
      typeof row.jobs_found !== "number"
    ) {
      return [];
    }

    const jobLabel = row.jobs_found === 1 ? "job" : "jobs";
    return [
      {
        color: "success" as const,
        id: `search-${row.id}`,
        label: `Found ${row.jobs_found} ${jobLabel} for ${row.job_title_searched}`,
        occurredAt: row.completed_at,
        time: formatRelativeTime(row.completed_at, now),
      },
    ];
  });
}

function normalizeResearchActivities(
  value: unknown,
  now: number,
): DashboardActivityItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const row = item as ResearchRow;
    if (
      typeof row.id !== "string" ||
      typeof row.company !== "string" ||
      typeof row.company_researched_at !== "string"
    ) {
      return [];
    }

    return [
      {
        color: "info" as const,
        id: `research-${row.id}`,
        label: `Researched ${row.company}`,
        occurredAt: row.company_researched_at,
        time: formatRelativeTime(row.company_researched_at, now),
      },
    ];
  });
}

export async function loadDashboardActivity({
  insforge,
  userId,
}: {
  insforge: InsforgeServerClient;
  userId: string;
}): Promise<DashboardActivity> {
  const [runsResult, researchResult] = await Promise.all([
    insforge.database
      .from("agent_runs")
      .select("id,job_title_searched,jobs_found,completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(ACTIVITY_LIMIT),
    insforge.database
      .from("jobs")
      .select("id,company,company_researched_at")
      .eq("user_id", userId)
      .not("company_researched_at", "is", null)
      .order("company_researched_at", { ascending: false })
      .limit(ACTIVITY_LIMIT),
  ]);

  if (runsResult.error) {
    console.error("[lib/dashboard] load search activity", runsResult.error);
  }
  if (researchResult.error) {
    console.error(
      "[lib/dashboard] load research activity",
      researchResult.error,
    );
  }

  const now = Date.now();
  const items = [
    ...(runsResult.error
      ? []
      : normalizeSearchActivities(runsResult.data, now)),
    ...(researchResult.error
      ? []
      : normalizeResearchActivities(researchResult.data, now)),
  ]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    )
    .slice(0, ACTIVITY_LIMIT);

  return {
    error: Boolean(runsResult.error || researchResult.error),
    items,
  };
}

export async function loadDashboardStats({
  insforge,
  userId,
}: {
  insforge: InsforgeServerClient;
  userId: string;
}): Promise<DashboardStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * MILLIS_PER_DAY).toISOString();
  const jobs = insforge.database.from("jobs");

  const [totalResult, matchResult, researchResult, weeklyResult] =
    await Promise.all([
      jobs
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      jobs.select("match_score").eq("user_id", userId),
      jobs
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("company_research", "is", null),
      jobs
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("found_at", sevenDaysAgo),
    ]);

  if (totalResult.error) {
    logStatsError("total jobs", totalResult.error);
  }
  if (matchResult.error) {
    logStatsError("average match rate", matchResult.error);
  }
  if (researchResult.error) {
    logStatsError("companies researched", researchResult.error);
  }
  if (weeklyResult.error) {
    logStatsError("jobs this week", weeklyResult.error);
  }

  const matchScores = matchResult.error
    ? []
    : ((matchResult.data ?? []) as MatchScoreRow[]).flatMap((row) =>
        typeof row.match_score === "number" ? [row.match_score] : [],
      );
  const averageMatchRate = matchResult.error
    ? null
    : matchScores.length === 0
      ? 0
      : Math.round(
          matchScores.reduce((sum, score) => sum + score, 0) /
            matchScores.length,
        );

  return {
    averageMatchRate,
    companiesResearched: researchResult.error
      ? null
      : (researchResult.count ?? 0),
    jobsThisWeek: weeklyResult.error ? null : (weeklyResult.count ?? 0),
    totalJobs: totalResult.error ? null : (totalResult.count ?? 0),
  };
}
