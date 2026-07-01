import { z } from "zod";

export const extractedWorkExperienceSchema = z.object({
  companyName: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean(),
  jobTitle: z.string(),
  responsibilities: z.string(),
  startDate: z.string(),
});

export const profileExtractionSchema = z.object({
  currentTitle: z.string(),
  education: z.object({
    fieldOfStudy: z.string(),
    graduationYear: z.string(),
    highestDegree: z.string(),
    institutionName: z.string(),
  }),
  experienceLevel: z.enum(["", "junior", "mid", "senior", "lead"]),
  fullName: z.string(),
  industries: z.array(z.string()),
  jobTitlesSeeking: z.array(z.string()),
  linkedinUrl: z.string(),
  location: z.string(),
  phone: z.string(),
  portfolioUrl: z.string(),
  skills: z.array(z.string()),
  workExperience: z.array(extractedWorkExperienceSchema).max(3),
  yearsExperience: z.string(),
});

export type ProfileExtraction = z.infer<typeof profileExtractionSchema>;

export const profileExtractionResponseSchema = z.discriminatedUnion("success", [
  z.object({
    data: profileExtractionSchema,
    success: z.literal(true),
  }),
  z.object({
    error: z.string(),
    success: z.literal(false),
  }),
]);

export type ProfileExtractionResponse = z.infer<
  typeof profileExtractionResponseSchema
>;
