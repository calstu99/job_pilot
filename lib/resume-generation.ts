import { z } from "zod";

export const generatedRoleContentSchema = z.object({
  bulletPoints: z.array(z.string().min(1).max(120)).min(1).max(2),
  roleIndex: z.number().int().min(0).max(2),
});

export const generatedResumeContentSchema = z.object({
  professionalSummary: z.string().min(1).max(260),
  roles: z.array(generatedRoleContentSchema).min(1).max(3),
});

export type GeneratedResumeContent = z.infer<
  typeof generatedResumeContentSchema
>;

export const resumeGenerationResponseSchema = z.discriminatedUnion("success", [
  z.object({
    data: z.object({
      key: z.string(),
      url: z.string(),
    }),
    success: z.literal(true),
  }),
  z.object({
    error: z.string(),
    success: z.literal(false),
  }),
]);

export type ResumeGenerationResponse = z.infer<
  typeof resumeGenerationResponseSchema
>;
