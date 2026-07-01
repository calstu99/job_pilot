import { revalidatePath } from "next/cache";
import { z } from "zod";
import { researchCompany } from "@/agent/research";
import type { JobForResearch, ProfileForResearch } from "@/agent/types";
import {
  createInsforgeServer,
  getCurrentUser,
} from "@/lib/insforge-server";
import type { CompanyResearchResponse } from "@/lib/company-research";
import { capturePostHogEvent } from "@/lib/posthog-server";

const requestSchema = z.object({
  jobId: z.uuid(),
});

const jobSelect = [
  "about_role",
  "company",
  "matched_skills",
  "missing_skills",
  "run_id",
  "source_url",
  "title",
].join(",");

const profileSelect = [
  "current_title",
  "experience_level",
  "skills",
  "work_experience",
  "years_experience",
].join(",");

function jsonResponse(
  body: CompanyResearchResponse,
  status: number,
): Response {
  return Response.json(body, { status });
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeJob(value: unknown): JobForResearch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  if (typeof row.company !== "string" || typeof row.title !== "string") {
    return null;
  }

  return {
    company: row.company,
    description: readString(row.about_role),
    matchedSkills: readStringArray(row.matched_skills),
    missingSkills: readStringArray(row.missing_skills),
    sourceUrl: typeof row.source_url === "string" ? row.source_url : null,
    title: row.title,
  };
}

function normalizeProfile(value: unknown): ProfileForResearch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  return {
    currentTitle: readString(row.current_title),
    experienceLevel: readString(row.experience_level),
    skills: readStringArray(row.skills),
    workExperience: row.work_experience,
    yearsExperience:
      typeof row.years_experience === "number"
        ? row.years_experience
        : null,
  };
}

async function logResearchEvent({
  insforge,
  jobId,
  level,
  message,
  runId,
  userId,
}: {
  insforge: Awaited<ReturnType<typeof createInsforgeServer>>;
  jobId: string;
  level: "error" | "warning";
  message: string;
  runId: string | null;
  userId: string;
}): Promise<void> {
  if (!runId) return;

  const result = await insforge.database.from("agent_logs").insert([
    {
      job_id: jobId,
      level,
      message,
      run_id: runId,
      user_id: userId,
    },
  ]);

  if (result.error) {
    console.error("[api/agent/research] log event", result.error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        {
          code: "UNAUTHENTICATED",
          error: "Please sign in to research this company.",
          success: false,
        },
        401,
      );
    }

    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return jsonResponse(
        {
          code: "INVALID_REQUEST",
          error: "Choose a valid job and try again.",
          success: false,
        },
        400,
      );
    }

    const parsedRequest = requestSchema.safeParse(requestBody);

    if (!parsedRequest.success) {
      return jsonResponse(
        {
          code: "INVALID_REQUEST",
          error: "Choose a valid job and try again.",
          success: false,
        },
        400,
      );
    }

    const insforge = await createInsforgeServer();
    const [jobResult, profileResult] = await Promise.all([
      insforge.database
        .from("jobs")
        .select(jobSelect)
        .eq("id", parsedRequest.data.jobId)
        .eq("user_id", user.id)
        .maybeSingle(),
      insforge.database
        .from("profiles")
        .select(profileSelect)
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (jobResult.error || profileResult.error) {
      console.error("[api/agent/research] load inputs", {
        jobError: jobResult.error,
        profileError: profileResult.error,
      });
      return jsonResponse(
        {
          code: "RESEARCH_FAILED",
          error: "We could not load the research details. Please try again.",
          success: false,
        },
        500,
      );
    }

    const job = normalizeJob(jobResult.data);
    const profile = normalizeProfile(profileResult.data);
    const runId =
      jobResult.data && typeof jobResult.data === "object"
        ? readString((jobResult.data as Record<string, unknown>).run_id) || null
        : null;

    if (!job) {
      return jsonResponse(
        {
          code: "JOB_NOT_FOUND",
          error: "This job is no longer available.",
          success: false,
        },
        404,
      );
    }

    if (!profile) {
      return jsonResponse(
        {
          code: "RESEARCH_FAILED",
          error: "We could not load your profile. Please try again.",
          success: false,
        },
        500,
      );
    }

    const researchResult = await researchCompany({ job, profile });

    if (!researchResult.success) {
      await logResearchEvent({
        insforge,
        jobId: parsedRequest.data.jobId,
        level: "error",
        message: "Company research generation failed.",
        runId,
        userId: user.id,
      });
      return jsonResponse(
        {
          code: "RESEARCH_FAILED",
          error: researchResult.error,
          success: false,
        },
        502,
      );
    }

    if (!researchResult.browserEvidenceFound) {
      await logResearchEvent({
        insforge,
        jobId: parsedRequest.data.jobId,
        level: "warning",
        message:
          "Website research was unavailable; the dossier used saved job and profile data.",
        runId,
        userId: user.id,
      });
    }

    const updateResult = await insforge.database
      .from("jobs")
      .update({
        company_research: researchResult.dossier,
        company_researched_at: new Date().toISOString(),
      })
      .eq("id", parsedRequest.data.jobId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (updateResult.error || !updateResult.data) {
      console.error(
        "[api/agent/research] save dossier",
        updateResult.error,
      );
      await logResearchEvent({
        insforge,
        jobId: parsedRequest.data.jobId,
        level: "error",
        message: "Company research could not be saved.",
        runId,
        userId: user.id,
      });
      return jsonResponse(
        {
          code: "RESEARCH_FAILED",
          error: "We could not save this research. Please try again.",
          success: false,
        },
        500,
      );
    }

    revalidatePath(`/find-jobs/${parsedRequest.data.jobId}`);
    await capturePostHogEvent({
      name: "company_researched",
      properties: {
        company: job.company,
        jobId: parsedRequest.data.jobId,
        userId: user.id,
      },
    });

    return jsonResponse(
      { data: { dossier: researchResult.dossier }, success: true },
      200,
    );
  } catch (error) {
    console.error("[api/agent/research]", error);
    return jsonResponse(
      {
        code: "RESEARCH_FAILED",
        error: "We could not complete this research. Please try again.",
        success: false,
      },
      500,
    );
  }
}
