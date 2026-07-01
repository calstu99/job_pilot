import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type {
  AdzunaJob,
  JobMatch,
  ProfileForMatching,
} from "@/agent/types";

const jobMatchSchema = z.object({
  matchReason: z.string().min(1).max(500),
  matchedSkills: z.array(z.string().min(1).max(80)).max(12),
  matchScore: z.number().int().min(0).max(100),
  missingSkills: z.array(z.string().min(1).max(80)).max(12),
});

const matchingInstructions = `Score one job against one candidate profile.

Rules:
- Use only the supplied profile and Adzuna job snippet.
- Return matchScore as an integer from 0 to 100.
- Base the score on demonstrated skills, experience, sought roles, industry relevance, and seniority alignment.
- matchedSkills must contain only skills supported by the candidate profile and relevant to the job.
- missingSkills must contain only concrete skills or qualifications requested or strongly implied by the job snippet that are absent from the profile.
- matchReason must be one concise paragraph explaining the strongest alignment and most important gap.
- If the snippet is thin, score conservatively and acknowledge the limited evidence in matchReason.
- Never invent candidate experience or job requirements.`;

export async function scoreJobAgainstProfile(
  job: AdzunaJob,
  profile: ProfileForMatching,
): Promise<JobMatch> {
  const openai = new OpenAI();
  const response = await openai.responses.parse({
    input: [
      {
        content: matchingInstructions,
        role: "system",
      },
      {
        content: JSON.stringify({
          candidate: profile,
          job: {
            company: job.company?.display_name ?? "",
            description: job.description ?? "",
            location: job.location?.display_name ?? "",
            title: job.title ?? "",
          },
        }),
        role: "user",
      },
    ],
    max_output_tokens: 300,
    model: "gpt-4o",
    text: {
      format: zodTextFormat(jobMatchSchema, "job_match"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no parsed job match.");
  }

  return response.output_parsed;
}
