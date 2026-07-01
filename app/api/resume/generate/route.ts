import { generateResumeContent } from "@/agent/resume-generator";
import {
  createInsforgeServer,
  getCurrentUser,
} from "@/lib/insforge-server";
import {
  createProfileViewModel,
  isCompleteWorkExperienceRole,
  normalizeProfileRow,
  type ProfileViewModel,
} from "@/lib/profile";
import { renderResumePdf } from "@/lib/resume-pdf";
import type { ResumeGenerationResponse } from "@/lib/resume-generation";

const profileSelect = [
  "id",
  "full_name",
  "email",
  "phone",
  "location",
  "current_title",
  "experience_level",
  "years_experience",
  "skills",
  "industries",
  "work_experience",
  "education",
  "job_titles_seeking",
  "remote_preference",
  "preferred_locations",
  "salary_expectation",
  "cover_letter_tone",
  "linkedin_url",
  "portfolio_url",
  "work_authorization",
  "resume_pdf_url",
  "resume_pdf_key",
  "is_complete",
].join(",");

function jsonResponse(
  body: ResumeGenerationResponse,
  status: number,
): Response {
  return Response.json(body, { status });
}

function hasMinimumResumeProfile(profile: ProfileViewModel): boolean {
  return Boolean(
    profile.fullName.trim() &&
      profile.email.trim() &&
      profile.currentTitle.trim() &&
      profile.skills.length > 0 &&
      profile.workExperience.some(isCompleteWorkExperienceRole),
  );
}

export async function POST(): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { error: "Please sign in to generate a resume.", success: false },
        401,
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
      console.error("[api/resume/generate] load profile", profileError);
      return jsonResponse(
        {
          error: "We could not load your saved profile. Please try again.",
          success: false,
        },
        500,
      );
    }

    const profileRow = normalizeProfileRow(profileData);

    if (!profileRow) {
      return jsonResponse(
        {
          error: "Save your profile before generating a resume.",
          success: false,
        },
        422,
      );
    }

    const profile = createProfileViewModel(profileRow, user);

    if (!hasMinimumResumeProfile(profile)) {
      return jsonResponse(
        {
          error:
            "Add and save your name, contact email, current title, skills, and one complete work role first.",
          success: false,
        },
        422,
      );
    }

    const generatedContent = await generateResumeContent(profile);

    if (!generatedContent.success) {
      return jsonResponse(
        { error: generatedContent.error, success: false },
        502,
      );
    }

    const pdfBuffer = await renderResumePdf(profile, generatedContent.data);
    const resumeKey = `resumes/${user.id}/resume.pdf`;
    let previousResume: Blob | null = null;

    if (profile.resumePdfKey) {
      const { data: previousData, error: previousError } =
        await insforge.storage
          .from("resumes")
          .download(profile.resumePdfKey);

      if (previousError) {
        console.error(
          "[api/resume/generate] download existing resume",
          previousError,
        );
        return jsonResponse(
          {
            error:
              "We could not safely replace your existing resume. Please try again.",
            success: false,
          },
          500,
        );
      }

      previousResume = previousData;
    }

    const generatedPdf = new Blob([Uint8Array.from(pdfBuffer)], {
      type: "application/pdf",
    });
    const { data: uploadData, error: uploadError } =
      await insforge.storage
        .from("resumes")
        .upload(resumeKey, generatedPdf);

    if (uploadError || !uploadData) {
      console.error("[api/resume/generate] upload resume", uploadError);
      return jsonResponse(
        {
          error: "We could not save the generated resume. Please try again.",
          success: false,
        },
        500,
      );
    }

    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({
        resume_pdf_key: uploadData.key,
        resume_pdf_url: uploadData.url,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[api/resume/generate] update profile", updateError);

      if (previousResume) {
        const { error: rollbackError } = await insforge.storage
          .from("resumes")
          .upload(resumeKey, previousResume);

        if (rollbackError) {
          console.error(
            "[api/resume/generate] restore existing resume",
            rollbackError,
          );
        }
      } else {
        const { error: rollbackError } = await insforge.storage
          .from("resumes")
          .remove(uploadData.key);

        if (rollbackError) {
          console.error(
            "[api/resume/generate] remove generated resume",
            rollbackError,
          );
        }
      }

      return jsonResponse(
        {
          error: "We could not finish saving your resume. Please try again.",
          success: false,
        },
        500,
      );
    }

    return jsonResponse(
      {
        data: {
          key: uploadData.key,
          url: uploadData.url,
        },
        success: true,
      },
      200,
    );
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return jsonResponse(
      {
        error: "We could not generate your resume. Please try again.",
        success: false,
      },
      500,
    );
  }
}
