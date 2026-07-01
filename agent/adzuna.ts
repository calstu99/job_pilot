import type { InsforgeServerClient } from "@/lib/insforge-server";
import { scoreJobAgainstProfile } from "@/agent/matcher";
import type {
  AdzunaJob,
  ProfileForMatching,
  SupportedAdzunaCountry,
} from "@/agent/types";
import { searchAdzunaJobs } from "@/lib/adzuna";
import {
  type JobSearchResult,
  type JobSearchSummary,
} from "@/lib/job-discovery";
import { capturePostHogEvent } from "@/lib/posthog-server";
import { MATCH_THRESHOLD } from "@/lib/utils";

type DiscoverJobsInput = {
  country: SupportedAdzunaCountry;
  insforge: InsforgeServerClient;
  jobTitle: string;
  location: string;
  profile: ProfileForMatching;
  userId: string;
};

type DiscoverJobsOutput = {
  jobs: JobSearchResult[];
  summary: JobSearchSummary;
};

type ScoredJob = {
  job: AdzunaJob;
  match: Awaited<ReturnType<typeof scoreJobAgainstProfile>>;
};

const SCORING_CONCURRENCY = 3;

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function isUsableJob(job: AdzunaJob): boolean {
  return Boolean(
    normalizeText(job.title) &&
      normalizeText(job.company?.display_name) &&
      normalizeText(job.redirect_url),
  );
}

function deduplicateJobs(jobs: AdzunaJob[]): {
  duplicates: number;
  jobs: AdzunaJob[];
} {
  const seen = new Set<string>();
  const uniqueJobs: AdzunaJob[] = [];
  let duplicates = 0;

  for (const job of jobs) {
    const sourceUrl = normalizeText(job.redirect_url);

    if (!isUsableJob(job)) {
      continue;
    }

    if (seen.has(sourceUrl)) {
      duplicates += 1;
      continue;
    }

    seen.add(sourceUrl);
    uniqueJobs.push(job);
  }

  return { duplicates, jobs: uniqueJobs };
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<Array<PromiseSettledResult<R>>> {
  const results: Array<PromiseSettledResult<R>> = new Array(values.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;

      try {
        results[index] = {
          status: "fulfilled",
          value: await mapper(values[index]),
        };
      } catch (reason) {
        results[index] = { reason, status: "rejected" };
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, values.length) },
      () => worker(),
    ),
  );

  return results;
}

function formatSalary(
  job: AdzunaJob,
  country: SupportedAdzunaCountry,
): string | null {
  if (typeof job.salary_min !== "number") {
    return null;
  }

  const symbol = country === "gb" ? "£" : "$";
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  });
  const minimum = formatter.format(Math.round(job.salary_min / 1000));

  if (typeof job.salary_max !== "number") {
    return `${symbol}${minimum}k`;
  }

  const maximum = formatter.format(Math.round(job.salary_max / 1000));
  return `${symbol}${minimum}k - ${symbol}${maximum}k`;
}

function normalizeJobType(job: AdzunaJob):
  | "contract"
  | "fulltime"
  | "parttime" {
  const value = `${job.contract_time ?? ""} ${job.contract_type ?? ""}`
    .toLowerCase()
    .replaceAll("-", "_");

  if (value.includes("part_time")) {
    return "parttime";
  }

  if (value.includes("contract")) {
    return "contract";
  }

  return "fulltime";
}

async function addRunLog(
  insforge: InsforgeServerClient,
  input: {
    jobId?: string;
    level: "error" | "info" | "success" | "warning";
    message: string;
    runId: string;
    userId: string;
  },
): Promise<void> {
  const { error } = await insforge.database.from("agent_logs").insert([
    {
      job_id: input.jobId,
      level: input.level,
      message: input.message,
      run_id: input.runId,
      user_id: input.userId,
    },
  ]);

  if (error) {
    console.error("[agent/adzuna] write run log", error);
  }
}

async function markRunFailed(
  insforge: InsforgeServerClient,
  runId: string,
  userId: string,
): Promise<void> {
  const { error } = await insforge.database
    .from("agent_runs")
    .update({
      completed_at: new Date().toISOString(),
      status: "failed",
    })
    .eq("id", runId)
    .eq("user_id", userId);

  if (error) {
    console.error("[agent/adzuna] mark run failed", error);
  }
}

export async function discoverAndSaveJobs(
  input: DiscoverJobsInput,
): Promise<DiscoverJobsOutput> {
  const { data: runData, error: runError } = await input.insforge.database
    .from("agent_runs")
    .insert([
      {
        job_title_searched: input.jobTitle,
        location_searched: input.location || null,
        status: "running",
        user_id: input.userId,
      },
    ])
    .select("id")
    .single();

  const runId =
    runData &&
    typeof runData === "object" &&
    "id" in runData &&
    typeof runData.id === "string"
      ? runData.id
      : null;

  if (runError || !runId) {
    console.error("[agent/adzuna] create run", runError);
    throw new Error("Could not create the job discovery run.");
  }

  await addRunLog(input.insforge, {
    level: "info",
    message: `Searching Adzuna for ${input.jobTitle}.`,
    runId,
    userId: input.userId,
  });

  try {
    const providerJobs = await searchAdzunaJobs(
      input.jobTitle,
      input.location,
      input.country,
    );
    const deduplicated = deduplicateJobs(providerJobs);
    const sourceUrls = deduplicated.jobs.flatMap((job) =>
      job.redirect_url ? [job.redirect_url] : [],
    );

    let existingUrls = new Set<string>();

    if (sourceUrls.length > 0) {
      const { data: existingData, error: existingError } =
        await input.insforge.database
          .from("jobs")
          .select("source_url")
          .eq("user_id", input.userId)
          .in("source_url", sourceUrls);

      if (existingError) {
        console.error("[agent/adzuna] load duplicates", existingError);
        throw new Error("Could not check existing jobs.");
      }

      existingUrls = new Set(
        Array.isArray(existingData)
          ? existingData.flatMap((row) =>
              row &&
              typeof row === "object" &&
              "source_url" in row &&
              typeof row.source_url === "string"
                ? [row.source_url]
                : [],
            )
          : [],
      );
    }

    const newJobs = deduplicated.jobs.filter(
      (job) => !existingUrls.has(job.redirect_url ?? ""),
    );
    const scoringResults = await mapWithConcurrency(
      newJobs,
      SCORING_CONCURRENCY,
      async (job): Promise<ScoredJob> => ({
        job,
        match: await scoreJobAgainstProfile(job, input.profile),
      }),
    );
    const scoredJobs = scoringResults.flatMap((result) => {
      if (result.status === "fulfilled") {
        return [result.value];
      }

      console.error("[agent/adzuna] score job", result.reason);
      return [];
    });
    const savedJobs: JobSearchResult[] = [];

    for (const { job, match } of scoredJobs) {
      const sourceUrl = job.redirect_url!;
      const foundAt = new Date().toISOString();
      const { data: savedData, error: saveError } =
        await input.insforge.database
          .from("jobs")
          .insert([
            {
              about_role: normalizeText(job.description) || null,
              company: normalizeText(job.company?.display_name),
              external_apply_url: sourceUrl,
              found_at: foundAt,
              job_type: normalizeJobType(job),
              location: normalizeText(job.location?.display_name) || null,
              match_reason: match.matchReason,
              match_score: match.matchScore,
              matched_skills: match.matchedSkills,
              missing_skills: match.missingSkills,
              run_id: runId,
              salary: formatSalary(job, input.country),
              source: "search",
              source_url: sourceUrl,
              title: normalizeText(job.title),
              user_id: input.userId,
            },
          ])
          .select("id")
          .single();

      const jobId =
        savedData &&
        typeof savedData === "object" &&
        "id" in savedData &&
        typeof savedData.id === "string"
          ? savedData.id
          : null;

      if (saveError || !jobId) {
        console.error("[agent/adzuna] save job", saveError);
        continue;
      }

      savedJobs.push({
        company: normalizeText(job.company?.display_name),
        dateFound: foundAt,
        id: jobId,
        role: normalizeText(job.title),
        salary: formatSalary(job, input.country),
        score: match.matchScore,
      });

      await Promise.all([
        addRunLog(input.insforge, {
          jobId,
          level: "success",
          message: `Saved ${normalizeText(job.title)} at ${normalizeText(job.company?.display_name)}.`,
          runId,
          userId: input.userId,
        }),
        capturePostHogEvent({
          name: "job_found",
          properties: {
            matchScore: match.matchScore,
            source: "search",
            userId: input.userId,
          },
        }),
      ]);
    }

    const summary: JobSearchSummary = {
      found: providerJobs.length,
      saved: savedJobs.length,
      skippedDuplicates:
        deduplicated.duplicates + existingUrls.size,
      skippedFailures: newJobs.length - savedJobs.length,
      strongMatches: savedJobs.filter(
        (job) => job.score >= MATCH_THRESHOLD,
      ).length,
    };
    const { error: completeError } = await input.insforge.database
      .from("agent_runs")
      .update({
        completed_at: new Date().toISOString(),
        jobs_found: savedJobs.length,
        status: "completed",
      })
      .eq("id", runId)
      .eq("user_id", input.userId);

    if (completeError) {
      console.error("[agent/adzuna] complete run", completeError);
      throw new Error("Could not complete the job discovery run.");
    }

    await addRunLog(input.insforge, {
      level: summary.skippedFailures > 0 ? "warning" : "success",
      message: `Search complete: ${summary.saved} saved, ${summary.skippedDuplicates} duplicates, ${summary.skippedFailures} skipped.`,
      runId,
      userId: input.userId,
    });

    return { jobs: savedJobs, summary };
  } catch (error) {
    await Promise.all([
      markRunFailed(input.insforge, runId, input.userId),
      addRunLog(input.insforge, {
        level: "error",
        message: "Job discovery failed before it could complete.",
        runId,
        userId: input.userId,
      }),
    ]);
    throw error;
  }
}
