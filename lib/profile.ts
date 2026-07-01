import type { CurrentUser } from "@/lib/insforge-server";

export type ExperienceLevel = "junior" | "mid" | "senior" | "lead";
export type RemotePreference = "remote" | "onsite" | "hybrid" | "any";
export type CoverLetterTone = "formal" | "casual" | "enthusiastic";
export type WorkAuthorization =
  | "citizen"
  | "permanent_resident"
  | "visa_required";

export type WorkExperienceRole = {
  companyName: string;
  endDate: string;
  isCurrent: boolean;
  jobTitle: string;
  responsibilities: string;
  startDate: string;
};

export type Education = {
  fieldOfStudy: string;
  graduationYear: string;
  highestDegree: string;
  institutionName: string;
};

export type ProfileFormValues = {
  coverLetterTone: CoverLetterTone | "";
  currentTitle: string;
  education: Education;
  email: string;
  experienceLevel: ExperienceLevel | "";
  fullName: string;
  industries: string[];
  jobTitlesSeeking: string[];
  linkedinUrl: string;
  location: string;
  phone: string;
  portfolioUrl: string;
  preferredLocations: string[];
  remotePreference: RemotePreference | "";
  resumePdfKey: string;
  resumePdfUrl: string;
  salaryExpectation: string;
  skills: string[];
  workAuthorization: WorkAuthorization | "";
  workExperience: WorkExperienceRole[];
  yearsExperience: string;
};

export type ProfileCompletion = {
  isComplete: boolean;
  missingFields: string[];
  percentage: number;
};

export type ProfileViewModel = ProfileFormValues & ProfileCompletion;

export type ProfileRow = {
  cover_letter_tone: string | null;
  current_title: string | null;
  education: unknown;
  email: string | null;
  experience_level: string | null;
  full_name: string | null;
  id: string;
  industries: unknown;
  is_complete: boolean;
  job_titles_seeking: unknown;
  linkedin_url: string | null;
  location: string | null;
  phone: string | null;
  portfolio_url: string | null;
  preferred_locations: unknown;
  remote_preference: string | null;
  resume_pdf_key: string | null;
  resume_pdf_url: string | null;
  salary_expectation: string | null;
  skills: unknown;
  work_authorization: string | null;
  work_experience: unknown;
  years_experience: number | null;
};

export const experienceLevelOptions = [
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
] satisfies Array<{ label: string; value: ExperienceLevel }>;

export const remotePreferenceOptions = [
  { label: "Any", value: "any" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Onsite", value: "onsite" },
] satisfies Array<{ label: string; value: RemotePreference }>;

export const coverLetterToneOptions = [
  { label: "Formal", value: "formal" },
  { label: "Casual", value: "casual" },
  { label: "Enthusiastic", value: "enthusiastic" },
] satisfies Array<{ label: string; value: CoverLetterTone }>;

export const workAuthorizationOptions = [
  { label: "Citizen", value: "citizen" },
  { label: "Permanent resident", value: "permanent_resident" },
  { label: "Visa required", value: "visa_required" },
] satisfies Array<{ label: string; value: WorkAuthorization }>;

const emptyEducation: Education = {
  fieldOfStudy: "",
  graduationYear: "",
  highestDegree: "",
  institutionName: "",
};

export const emptyWorkExperienceRole: WorkExperienceRole = {
  companyName: "",
  endDate: "",
  isCurrent: false,
  jobTitle: "",
  responsibilities: "",
  startDate: "",
};

export function isCompleteWorkExperienceRole(
  role: WorkExperienceRole,
): boolean {
  return Boolean(
    role.companyName.trim() &&
      role.jobTitle.trim() &&
      role.responsibilities.trim(),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readEducation(value: unknown): Education {
  if (!isRecord(value)) {
    return emptyEducation;
  }

  return {
    fieldOfStudy: readString(value.fieldOfStudy),
    graduationYear: readString(value.graduationYear),
    highestDegree: readString(value.highestDegree),
    institutionName: readString(value.institutionName),
  };
}

function readWorkExperience(value: unknown): WorkExperienceRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((role) => ({
      companyName: readString(role.companyName),
      endDate: readString(role.endDate),
      isCurrent: readBoolean(role.isCurrent),
      jobTitle: readString(role.jobTitle),
      responsibilities: readString(role.responsibilities),
      startDate: readString(role.startDate),
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
}

function readOption<T extends string>(value: string | null, options: T[]): T | "" {
  if (!value) {
    return "";
  }

  return options.find((option) => option === value) ?? "";
}

export function normalizeProfileRow(value: unknown): ProfileRow | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    cover_letter_tone:
      typeof value.cover_letter_tone === "string" ? value.cover_letter_tone : null,
    current_title:
      typeof value.current_title === "string" ? value.current_title : null,
    education: value.education,
    email: typeof value.email === "string" ? value.email : null,
    experience_level:
      typeof value.experience_level === "string" ? value.experience_level : null,
    full_name: typeof value.full_name === "string" ? value.full_name : null,
    id: value.id,
    industries: value.industries,
    is_complete:
      typeof value.is_complete === "boolean" ? value.is_complete : false,
    job_titles_seeking: value.job_titles_seeking,
    linkedin_url:
      typeof value.linkedin_url === "string" ? value.linkedin_url : null,
    location: typeof value.location === "string" ? value.location : null,
    phone: typeof value.phone === "string" ? value.phone : null,
    portfolio_url:
      typeof value.portfolio_url === "string" ? value.portfolio_url : null,
    preferred_locations: value.preferred_locations,
    remote_preference:
      typeof value.remote_preference === "string"
        ? value.remote_preference
        : null,
    resume_pdf_key:
      typeof value.resume_pdf_key === "string" ? value.resume_pdf_key : null,
    resume_pdf_url:
      typeof value.resume_pdf_url === "string" ? value.resume_pdf_url : null,
    salary_expectation:
      typeof value.salary_expectation === "string"
        ? value.salary_expectation
        : null,
    skills: value.skills,
    work_authorization:
      typeof value.work_authorization === "string"
        ? value.work_authorization
        : null,
    work_experience: value.work_experience,
    years_experience:
      typeof value.years_experience === "number" ? value.years_experience : null,
  };
}

export function calculateProfileCompletion(
  profile: ProfileFormValues,
): ProfileCompletion {
  const requiredFields = [
    { label: "FULL NAME", present: Boolean(profile.fullName.trim()) },
    { label: "EMAIL", present: Boolean(profile.email.trim()) },
    { label: "PHONE", present: Boolean(profile.phone.trim()) },
    { label: "LOCATION", present: Boolean(profile.location.trim()) },
    { label: "CURRENT TITLE", present: Boolean(profile.currentTitle.trim()) },
    { label: "EXPERIENCE LEVEL", present: Boolean(profile.experienceLevel) },
    { label: "YEARS EXPERIENCE", present: Boolean(profile.yearsExperience.trim()) },
    { label: "SKILLS", present: profile.skills.length > 0 },
    {
      label: "WORK EXPERIENCE",
      present: profile.workExperience.some(isCompleteWorkExperienceRole),
    },
    {
      label: "EDUCATION",
      present:
        Boolean(profile.education.highestDegree.trim()) &&
        Boolean(profile.education.fieldOfStudy.trim()) &&
        Boolean(profile.education.institutionName.trim()) &&
        Boolean(profile.education.graduationYear.trim()),
    },
    {
      label: "JOB TITLES",
      present: profile.jobTitlesSeeking.length > 0,
    },
    { label: "REMOTE PREFERENCE", present: Boolean(profile.remotePreference) },
    { label: "COVER LETTER TONE", present: Boolean(profile.coverLetterTone) },
    {
      label: "WORK AUTHORIZATION",
      present: Boolean(profile.workAuthorization),
    },
  ];

  const completeCount = requiredFields.filter((field) => field.present).length;
  const missingFields = requiredFields
    .filter((field) => !field.present)
    .map((field) => field.label);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    percentage: Math.round((completeCount / requiredFields.length) * 100),
  };
}

export function createProfileViewModel(
  row: ProfileRow | null,
  user: CurrentUser,
): ProfileViewModel {
  const profile: ProfileFormValues = {
    coverLetterTone: readOption(
      row?.cover_letter_tone ?? null,
      coverLetterToneOptions.map((option) => option.value),
    ),
    currentTitle: row?.current_title ?? "",
    education: readEducation(row?.education),
    email: row?.email ?? user.email,
    experienceLevel: readOption(
      row?.experience_level ?? null,
      experienceLevelOptions.map((option) => option.value),
    ),
    fullName: row?.full_name ?? user.profile?.name ?? "",
    industries: readStringArray(row?.industries),
    jobTitlesSeeking: readStringArray(row?.job_titles_seeking),
    linkedinUrl: row?.linkedin_url ?? "",
    location: row?.location ?? "",
    phone: row?.phone ?? "",
    portfolioUrl: row?.portfolio_url ?? "",
    preferredLocations: readStringArray(row?.preferred_locations),
    remotePreference: readOption(
      row?.remote_preference ?? null,
      remotePreferenceOptions.map((option) => option.value),
    ),
    resumePdfKey: row?.resume_pdf_key ?? "",
    resumePdfUrl: row?.resume_pdf_url ?? "",
    salaryExpectation: row?.salary_expectation ?? "",
    skills: readStringArray(row?.skills),
    workAuthorization: readOption(
      row?.work_authorization ?? null,
      workAuthorizationOptions.map((option) => option.value),
    ),
    workExperience: readWorkExperience(row?.work_experience),
    yearsExperience:
      row?.years_experience === null || row?.years_experience === undefined
        ? ""
        : String(row.years_experience),
  };

  return {
    ...profile,
    ...calculateProfileCompletion(profile),
  };
}
