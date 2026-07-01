import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  profileExtractionSchema,
  type ProfileExtraction,
} from "@/lib/profile-extraction";

type ExtractProfileResult =
  | {
      data: ProfileExtraction;
      success: true;
    }
  | {
      error: string;
      success: false;
    };

const extractionInstructions = `Extract only information directly supported by the resume text.

Rules:
- Return an empty string or empty array when information is absent. Never invent values.
- Do not extract or infer email, work authorization, remote preference, salary expectations, preferred locations, or cover-letter tone.
- experienceLevel must be "", "junior", "mid", "senior", or "lead".
- yearsExperience must be a whole-number string based on the dated work history, or "" when it cannot be determined.
- currentTitle is the most recent role title.
- jobTitlesSeeking may contain the current or recent role titles supported by the resume.
- Keep at most the three most recent work experience roles.
- Use readable month/year values for work dates when available.
- Combine responsibility bullets for a role into a concise newline-separated string.
- linkedinUrl is only a LinkedIn profile URL.
- portfolioUrl may be a portfolio, personal site, or GitHub profile URL.`;

export async function extractProfileFromResumeText(
  resumeText: string,
): Promise<ExtractProfileResult> {
  try {
    const openai = new OpenAI();
    const response = await openai.responses.parse({
      input: [
        {
          content: extractionInstructions,
          role: "system",
        },
        {
          content: resumeText,
          role: "user",
        },
      ],
      max_output_tokens: 800,
      model: "gpt-4o",
      text: {
        format: zodTextFormat(profileExtractionSchema, "profile_extraction"),
      },
    });

    if (!response.output_parsed) {
      return {
        error: "We could not extract profile details from this resume.",
        success: false,
      };
    }

    return {
      data: response.output_parsed,
      success: true,
    };
  } catch (error) {
    console.error("[agent/profile-extractor]", error);
    return {
      error: "We could not extract profile details from this resume.",
      success: false,
    };
  }
}
