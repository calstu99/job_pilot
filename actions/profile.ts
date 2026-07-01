"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogEvent } from "@/lib/posthog-server";
import {
  calculateProfileCompletion,
  coverLetterToneOptions,
  experienceLevelOptions,
  normalizeProfileRow,
  remotePreferenceOptions,
  type CoverLetterTone,
  type Education,
  type ExperienceLevel,
  type ProfileFormValues,
  type RemotePreference,
  type WorkAuthorization,
  type WorkExperienceRole,
  workAuthorizationOptions,
} from "@/lib/profile";

export type SaveProfileState = {
  message: string;
  savedAt?: number;
  success: boolean;
};

type ProfileDatabasePayload = {
  cover_letter_tone: CoverLetterTone | null;
  current_title: string | null;
  education: Education;
  email: string;
  experience_level: ExperienceLevel | null;
  full_name: string | null;
  id?: string;
  industries: string[];
  is_complete: boolean;
  job_titles_seeking: string[];
  linkedin_url: string | null;
  location: string | null;
  phone: string | null;
  portfolio_url: string | null;
  preferred_locations: string[];
  remote_preference: RemotePreference | null;
  resume_pdf_key: string | null;
  resume_pdf_url: string | null;
  salary_expectation: string | null;
  skills: string[];
  work_authorization: WorkAuthorization | null;
  work_experience: WorkExperienceRole[];
  years_experience: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseStringArray(formData: FormData, key: string): string[] {
  const raw = formString(formData, key);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("[actions/profile] parseStringArray", error);
    return [];
  }
}

function parseEducation(formData: FormData): Education {
  return {
    fieldOfStudy: formString(formData, "field_of_study"),
    graduationYear: formString(formData, "graduation_year"),
    highestDegree: formString(formData, "highest_degree"),
    institutionName: formString(formData, "institution_name"),
  };
}

function parseWorkExperience(formData: FormData): WorkExperienceRole[] {
  const raw = formString(formData, "work_experience");

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isRecord)
      .map((role) => ({
        companyName:
          typeof role.companyName === "string" ? role.companyName.trim() : "",
        endDate: typeof role.endDate === "string" ? role.endDate.trim() : "",
        isCurrent:
          typeof role.isCurrent === "boolean" ? role.isCurrent : false,
        jobTitle:
          typeof role.jobTitle === "string" ? role.jobTitle.trim() : "",
        responsibilities:
          typeof role.responsibilities === "string"
            ? role.responsibilities.trim()
            : "",
        startDate:
          typeof role.startDate === "string" ? role.startDate.trim() : "",
      }))
      .filter(
        (role) =>
          role.companyName ||
          role.jobTitle ||
          role.startDate ||
          role.endDate ||
          role.responsibilities,
      )
      .slice(0, 3);
  } catch (error) {
    console.error("[actions/profile] parseWorkExperience", error);
    return [];
  }
}

function parseOption<T extends string>(
  value: string,
  options: Array<{ label: string; value: T }>,
): T | "" {
  return options.find((option) => option.value === value)?.value ?? "";
}

function parseProfileValues(formData: FormData): ProfileFormValues {
  return {
    coverLetterTone: parseOption(
      formString(formData, "cover_letter_tone"),
      coverLetterToneOptions,
    ),
    currentTitle: formString(formData, "current_title"),
    education: parseEducation(formData),
    email: formString(formData, "email"),
    experienceLevel: parseOption(
      formString(formData, "experience_level"),
      experienceLevelOptions,
    ),
    fullName: formString(formData, "full_name"),
    industries: parseStringArray(formData, "industries"),
    jobTitlesSeeking: parseStringArray(formData, "job_titles_seeking"),
    linkedinUrl: formString(formData, "linkedin_url"),
    location: formString(formData, "location"),
    phone: formString(formData, "phone"),
    portfolioUrl: formString(formData, "portfolio_url"),
    preferredLocations: parseStringArray(formData, "preferred_locations"),
    remotePreference: parseOption(
      formString(formData, "remote_preference"),
      remotePreferenceOptions,
    ),
    resumePdfKey: "",
    resumePdfUrl: "",
    salaryExpectation: formString(formData, "salary_expectation"),
    skills: parseStringArray(formData, "skills"),
    workAuthorization: parseOption(
      formString(formData, "work_authorization"),
      workAuthorizationOptions,
    ),
    workExperience: parseWorkExperience(formData),
    yearsExperience: formString(formData, "years_experience"),
  };
}

function parseYearsExperience(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const years = Number.parseInt(value, 10);

  if (Number.isNaN(years) || years < 0) {
    return null;
  }

  return years;
}

function getResumeFile(formData: FormData): File | null {
  const file = formData.get("resume");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function validateResumeFile(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return "Please upload a PDF resume.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Resume uploads must be 5MB or smaller.";
  }

  return null;
}

export async function saveProfile(
  _previousState: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        message: "Please sign in again before saving your profile.",
        success: false,
      };
    }

    const insforge = await createInsforgeServer();
    const { data: existingData, error: existingError } =
      await insforge.database
        .from("profiles")
        .select("id,is_complete,resume_pdf_url,resume_pdf_key")
        .eq("id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error("[actions/profile] load existing profile", existingError);
      return {
        message: "We could not load your existing profile. Please try again.",
        success: false,
      };
    }

    const existingProfile = normalizeProfileRow(existingData);
    const values = parseProfileValues(formData);
    const yearsExperience = parseYearsExperience(values.yearsExperience);

    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return {
        message: "Enter a valid contact email address.",
        success: false,
      };
    }

    if (values.yearsExperience && yearsExperience === null) {
      return {
        message: "Years of experience must be zero or greater.",
        success: false,
      };
    }

    let resumePdfUrl = existingProfile?.resume_pdf_url ?? "";
    let resumePdfKey = existingProfile?.resume_pdf_key ?? "";
    const resumeFile = getResumeFile(formData);

    if (resumeFile) {
      const resumeValidationError = validateResumeFile(resumeFile);

      if (resumeValidationError) {
        return {
          message: resumeValidationError,
          success: false,
        };
      }

      const resumeKey = `resumes/${user.id}/resume.pdf`;
      const { data: uploadData, error: uploadError } =
        await insforge.storage.from("resumes").upload(resumeKey, resumeFile);

      if (uploadError || !uploadData) {
        console.error("[actions/profile] upload resume", uploadError);
        return {
          message: "We could not upload your resume. Please try again.",
          success: false,
        };
      }

      resumePdfUrl = uploadData.url;
      resumePdfKey = uploadData.key;
    }

    const valuesForCompletion: ProfileFormValues = {
      ...values,
      resumePdfKey,
      resumePdfUrl,
      yearsExperience: yearsExperience === null ? "" : String(yearsExperience),
    };
    const completion = calculateProfileCompletion(valuesForCompletion);

    const payload: ProfileDatabasePayload = {
      cover_letter_tone: values.coverLetterTone || null,
      current_title: optionalString(values.currentTitle),
      education: values.education,
      email: values.email,
      experience_level: values.experienceLevel || null,
      full_name: optionalString(values.fullName),
      industries: values.industries,
      is_complete: completion.isComplete,
      job_titles_seeking: values.jobTitlesSeeking,
      linkedin_url: optionalString(values.linkedinUrl),
      location: optionalString(values.location),
      phone: optionalString(values.phone),
      portfolio_url: optionalString(values.portfolioUrl),
      preferred_locations: values.preferredLocations,
      remote_preference: values.remotePreference || null,
      resume_pdf_key: optionalString(resumePdfKey),
      resume_pdf_url: optionalString(resumePdfUrl),
      salary_expectation: optionalString(values.salaryExpectation),
      skills: values.skills,
      work_authorization: values.workAuthorization || null,
      work_experience: values.workExperience,
      years_experience: yearsExperience,
    };

    if (existingProfile) {
      const { error: updateError } = await insforge.database
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

      if (updateError) {
        console.error("[actions/profile] update profile", updateError);
        return {
          message: "We could not save your profile. Please try again.",
          success: false,
        };
      }
    } else {
      const { error: insertError } = await insforge.database
        .from("profiles")
        .insert([{ ...payload, id: user.id }]);

      if (insertError) {
        console.error("[actions/profile] insert profile", insertError);
        return {
          message: "We could not save your profile. Please try again.",
          success: false,
        };
      }
    }

    if (!existingProfile?.is_complete && completion.isComplete) {
      await capturePostHogEvent({
        name: "profile_completed",
        properties: { userId: user.id },
      });
    }

    revalidatePath("/profile");

    return {
      message: completion.isComplete
        ? "Profile saved. You are ready for job matching."
        : "Profile saved. Complete the highlighted fields when you can.",
      savedAt: Date.now(),
      success: true,
    };
  } catch (error) {
    console.error("[actions/profile] saveProfile", error);
    return {
      message: "We could not save your profile. Please try again.",
      success: false,
    };
  }
}
