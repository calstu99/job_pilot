import { z } from "zod";
import { discoverAndSaveJobs } from "@/agent/adzuna";
import type { ProfileForMatching } from "@/agent/types";
import { detectAdzunaCountry } from "@/lib/adzuna";
import {
  createInsforgeServer,
  getCurrentUser,
} from "@/lib/insforge-server";
import type { JobSearchResponse } from "@/lib/job-discovery";
import { capturePostHogEvent } from "@/lib/posthog-server";

export const maxDuration = 60;

const requestSchema = z.object({
  jobTitle: z.string().trim().min(2).max(120),
  location: z.string().trim().max(120).default(""),
});

const profileSelect = [
  "current_title",
  "experience_level",
  "industries",
  "is_complete",
  "job_titles_seeking",
  "skills",
  "work_experience",
  "years_experience",
].join(",");

function jsonResponse(body: JobSearchResponse, status: number): Response {
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

function normalizeMatchingProfile(value: unknown): ProfileForMatching | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;

  if (row.is_complete !== true) {
    return null;
  }

  return {
    currentTitle: readString(row.current_title),
    experienceLevel: readString(row.experience_level),
    industries: readStringArray(row.industries),
    jobTitlesSeeking: readStringArray(row.job_titles_seeking),
    skills: readStringArray(row.skills),
    workExperience: row.work_experience,
    yearsExperience:
      typeof row.years_experience === "number"
        ? row.years_experience
        : null,
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        {
          code: "UNAUTHENTICATED",
          error: "Please sign in to find jobs.",
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
          error: "Enter a valid job title and try again.",
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
          error: "Enter a job title between 2 and 120 characters.",
          success: false,
        },
        400,
      );
    }

    const insforge = await createInsforgeServer();
    const { data: profileData, error: profileError } =
      await insforge.database
        .from("profiles")
        .select(profileSelect)
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error("[api/agent/find] load profile", profileError);
      return jsonResponse(
        {
          code: "SEARCH_FAILED",
          error: "We could not load your profile. Please try again.",
          success: false,
        },
        500,
      );
    }

    const profile = normalizeMatchingProfile(profileData);

    if (!profile) {
      return jsonResponse(
        {
          code: "INCOMPLETE_PROFILE",
          error: "Complete and save your profile before finding jobs.",
          success: false,
        },
        409,
      );
    }

    await capturePostHogEvent({
      name: "job_search_started",
      properties: {
        jobTitle: parsedRequest.data.jobTitle,
        location: parsedRequest.data.location,
        userId: user.id,
      },
    });

    const result = await discoverAndSaveJobs({
      country: detectAdzunaCountry(parsedRequest.data.location),
      insforge,
      jobTitle: parsedRequest.data.jobTitle,
      location: parsedRequest.data.location,
      profile,
      userId: user.id,
    });

    return jsonResponse({ data: result, success: true }, 200);
  } catch (error) {
    console.error("[api/agent/find]", error);
    return jsonResponse(
      {
        code: "SEARCH_FAILED",
        error: "We could not finish this job search. Please try again.",
        success: false,
      },
      502,
    );
  }
}
