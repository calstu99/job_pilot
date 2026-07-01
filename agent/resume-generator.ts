import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ProfileViewModel } from "@/lib/profile";
import {
  generatedResumeContentSchema,
  type GeneratedResumeContent,
} from "@/lib/resume-generation";

type GenerateResumeResult =
  | {
      data: GeneratedResumeContent;
      success: true;
    }
  | {
      error: string;
      success: false;
    };

const generationInstructions = `Create concise, professional resume content using only the supplied candidate facts.

Rules:
- Never invent or embellish employers, titles, dates, skills, responsibilities, metrics, achievements, education, or credentials.
- Write a two-to-three sentence professional summary grounded in the supplied title, experience, skills, and work history.
- Return exactly one roles entry for each supplied role, using its zero-based roleIndex.
- Rewrite each role's responsibilities into one or two concise bullet points.
- Preserve the meaning of the source responsibilities. Do not add numbers or outcomes that are not present.
- Keep the wording compact enough for a single-page resume.
- Do not mention job preferences, salary, work authorization, industries, or cover-letter tone.`;

export async function generateResumeContent(
  profile: ProfileViewModel,
): Promise<GenerateResumeResult> {
  try {
    const sourceRoles = profile.workExperience.map((role, roleIndex) => ({
      ...role,
      roleIndex,
    }));
    const openai = new OpenAI();
    const response = await openai.responses.parse({
      input: [
        {
          content: generationInstructions,
          role: "system",
        },
        {
          content: JSON.stringify({
            currentTitle: profile.currentTitle,
            education: profile.education,
            experienceLevel: profile.experienceLevel,
            skills: profile.skills,
            workExperience: sourceRoles,
            yearsExperience: profile.yearsExperience,
          }),
          role: "user",
        },
      ],
      max_output_tokens: 1000,
      model: "gpt-4o",
      text: {
        format: zodTextFormat(
          generatedResumeContentSchema,
          "generated_resume_content",
        ),
      },
    });

    if (!response.output_parsed) {
      return {
        error: "We could not generate resume content. Please try again.",
        success: false,
      };
    }

    const expectedRoleIndexes = sourceRoles.map((role) => role.roleIndex);
    const actualRoleIndexes = response.output_parsed.roles
      .map((role) => role.roleIndex)
      .sort((first, second) => first - second);

    if (
      expectedRoleIndexes.length !== actualRoleIndexes.length ||
      expectedRoleIndexes.some(
        (roleIndex, index) => roleIndex !== actualRoleIndexes[index],
      )
    ) {
      console.error("[agent/resume-generator] role mapping mismatch");
      return {
        error: "We could not generate resume content. Please try again.",
        success: false,
      };
    }

    return {
      data: response.output_parsed,
      success: true,
    };
  } catch (error) {
    console.error("[agent/resume-generator]", error);
    return {
      error: "We could not generate resume content. Please try again.",
      success: false,
    };
  }
}
