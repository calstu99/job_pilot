"use client";

import { useActionState, useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { saveProfile, type SaveProfileState } from "@/actions/profile";
import {
  coverLetterToneOptions,
  emptyWorkExperienceRole,
  experienceLevelOptions,
  remotePreferenceOptions,
  type ProfileViewModel,
  type WorkExperienceRole,
  workAuthorizationOptions,
} from "@/lib/profile";
import type {
  ProfileExtraction,
} from "@/lib/profile-extraction";
import { profileExtractionResponseSchema } from "@/lib/profile-extraction";

type ProfileFormProps = {
  profile: ProfileViewModel;
};

type FieldProps = {
  className?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
};

type SelectFieldProps = {
  className?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
};

type AddableListProps = {
  inputValue: string;
  items: string[];
  label: string;
  name: string;
  onAdd: () => void;
  onInputChange: (value: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
};

type MissingFieldTarget = {
  focusId: string;
  sectionId: string;
};

type ProfileScalarFields = {
  coverLetterTone: string;
  currentTitle: string;
  education: ProfileViewModel["education"];
  email: string;
  experienceLevel: string;
  fullName: string;
  linkedinUrl: string;
  location: string;
  phone: string;
  portfolioUrl: string;
  remotePreference: string;
  salaryExpectation: string;
  workAuthorization: string;
  yearsExperience: string;
};

type ExtractionStatus = {
  message: string;
  success: boolean;
};

const inputClassName =
  "mt-2 h-10 w-full rounded-lg border border-border bg-surface px-4 text-[16px] font-medium leading-6 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent";

const selectClassName =
  "mt-2 h-10 w-full cursor-pointer appearance-auto rounded-lg border border-border bg-surface px-4 pr-10 text-[16px] font-medium leading-6 text-text-primary shadow-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent";

const initialSaveProfileState: SaveProfileState = {
  message: "",
  success: false,
};

const missingFieldTargets: Record<string, MissingFieldTarget> = {
  "COVER LETTER TONE": {
    focusId: "cover_letter_tone",
    sectionId: "job-preferences-section",
  },
  "CURRENT TITLE": {
    focusId: "current_title",
    sectionId: "professional-info-section",
  },
  EDUCATION: {
    focusId: "highest_degree",
    sectionId: "education-section",
  },
  EMAIL: {
    focusId: "email",
    sectionId: "personal-info-section",
  },
  "EXPERIENCE LEVEL": {
    focusId: "experience_level",
    sectionId: "professional-info-section",
  },
  "FULL NAME": {
    focusId: "full_name",
    sectionId: "personal-info-section",
  },
  "JOB TITLES": {
    focusId: "job_titles_seeking_input",
    sectionId: "job-preferences-section",
  },
  LOCATION: {
    focusId: "location",
    sectionId: "personal-info-section",
  },
  PHONE: {
    focusId: "phone",
    sectionId: "personal-info-section",
  },
  "REMOTE PREFERENCE": {
    focusId: "remote_preference",
    sectionId: "job-preferences-section",
  },
  SKILLS: {
    focusId: "skills_input",
    sectionId: "professional-info-section",
  },
  "WORK AUTHORIZATION": {
    focusId: "work_authorization",
    sectionId: "personal-info-section",
  },
  "WORK EXPERIENCE": {
    focusId: "company_name_0",
    sectionId: "work-experience-section",
  },
  "YEARS EXPERIENCE": {
    focusId: "years_experience",
    sectionId: "professional-info-section",
  },
};

function completionStroke(percentage: number): string {
  const circumference = 282.74;
  const filled = (circumference * percentage) / 100;
  return `${filled.toFixed(2)} ${circumference}`;
}

function addListItem(items: string[], value: string): string[] {
  const nextItem = value.trim();

  if (!nextItem || items.includes(nextItem)) {
    return items;
  }

  return [...items, nextItem];
}

function createProfileScalarFields(
  profile: ProfileViewModel,
): ProfileScalarFields {
  return {
    coverLetterTone: profile.coverLetterTone,
    currentTitle: profile.currentTitle,
    education: profile.education,
    email: profile.email,
    experienceLevel: profile.experienceLevel,
    fullName: profile.fullName,
    linkedinUrl: profile.linkedinUrl,
    location: profile.location,
    phone: profile.phone,
    portfolioUrl: profile.portfolioUrl,
    remotePreference: profile.remotePreference,
    salaryExpectation: profile.salaryExpectation,
    workAuthorization: profile.workAuthorization,
    yearsExperience: profile.yearsExperience,
  };
}

function hasWorkExperienceContent(roles: WorkExperienceRole[]): boolean {
  return roles.some(
    (role) =>
      role.companyName.trim() ||
      role.jobTitle.trim() ||
      role.startDate.trim() ||
      role.endDate.trim() ||
      role.responsibilities.trim(),
  );
}

function TextField({
  className = "",
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: FieldProps): React.ReactNode {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );
}

function SelectField({
  className = "",
  label,
  name,
  onChange,
  options,
  value,
}: SelectFieldProps): React.ReactNode {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => onChange(event.currentTarget.value)}
        className={selectClassName}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AddableList({
  inputValue,
  items,
  label,
  name,
  onAdd,
  onInputChange,
  onRemove,
  placeholder,
}: AddableListProps): React.ReactNode {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      onAdd();
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <label
        htmlFor={`${name}_input`}
        className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
      >
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={`${name}_input`}
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 text-[16px] font-medium leading-6 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={onAdd}
          className="h-10 rounded-lg bg-surface-secondary px-5 text-[16px] font-bold leading-6 text-text-dark"
        >
          Add
        </button>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRemove(item)}
              className="rounded-lg border border-border bg-surface-secondary px-4 py-2 text-[16px] font-semibold leading-6 text-text-primary"
            >
              {item} <span className="text-text-secondary">x</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactNode {
  return (
    <section
      className={`mx-auto max-w-[936px] rounded-xl border border-border bg-surface p-8 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function FormSection({
  children,
  id,
  title,
}: {
  children: React.ReactNode;
  id: string;
  title: string;
}): React.ReactNode {
  return (
    <section
      id={id}
      className="scroll-mt-8 border-t border-border pt-16 first:border-t-0 first:pt-0"
    >
      <h3 className="text-[18px] font-bold leading-6 text-text-primary">
        {title}
      </h3>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function AttentionBanner({
  missingFields,
  percentage,
}: {
  missingFields: string[];
  percentage: number;
}): React.ReactNode {
  const isComplete = missingFields.length === 0;
  const title = isComplete ? "Profile ready" : "Profile needs attention";
  const description = isComplete
    ? "Your profile has enough detail for job matching and resume generation."
    : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes.";
  const accentClassName = isComplete ? "text-success" : "text-error";
  const borderClassName = isComplete ? "border-success/20" : "border-error/20";
  const tagClassName = isComplete
    ? "bg-success-lightest text-success-foreground"
    : "bg-error/5 text-error";
  const percentageClassName =
    percentage >= 100 ? "w-20 text-[30px]" : "text-[34px]";

  function handleMissingFieldClick(field: string): void {
    const target = missingFieldTargets[field];

    if (!target) {
      return;
    }

    document.getElementById(target.sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      const focusTarget = document.getElementById(target.focusId);

      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus({ preventScroll: true });
      }
    }, 350);
  }

  return (
    <section
      className={`mx-auto flex max-w-[936px] flex-col gap-8 rounded-xl border ${borderClassName} bg-surface px-8 py-9 shadow-sm lg:flex-row lg:items-center lg:justify-between`}
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`flex size-5 items-center justify-center rounded-full border-2 text-[13px] font-bold leading-none ${accentClassName}`}
          >
            {isComplete ? "ok" : "!"}
          </span>
          <h1 className="text-[22px] font-bold leading-7 text-text-primary">
            {title}
          </h1>
        </div>
        <p className="mt-4 max-w-[420px] text-[16px] font-medium leading-6 text-text-dark">
          {description}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {(isComplete ? ["COMPLETE"] : missingFields.slice(0, 6)).map(
            (field) =>
              isComplete ? (
                <span
                  key={field}
                  className={`rounded-md px-3 py-1 text-[12px] font-bold leading-4 tracking-wide ${tagClassName}`}
                >
                  {field}
                </span>
              ) : (
                <button
                  key={field}
                  type="button"
                  onClick={() => handleMissingFieldClick(field)}
                  className={`cursor-pointer rounded-md px-3 py-1 text-[12px] font-bold leading-4 tracking-wide transition hover:bg-error/10 focus:outline-none focus:ring-1 focus:ring-error ${tagClassName}`}
                  aria-label={`Go to ${field.toLowerCase()} field`}
                >
                  {field}
                </button>
              ),
          )}
        </div>
      </div>

      <div
        aria-label={`Profile completion ${percentage} percent`}
        className="relative mx-auto flex size-32 shrink-0 items-center justify-center rounded-full lg:mx-0"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="absolute inset-0 size-full -rotate-45"
        >
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={
              isComplete
                ? "color-mix(in srgb, var(--color-success) 14%, var(--color-surface))"
                : "color-mix(in srgb, var(--color-error) 14%, var(--color-surface))"
            }
            strokeWidth="16"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={isComplete ? "var(--color-success)" : "var(--color-error)"}
            strokeDasharray={completionStroke(percentage)}
            strokeLinecap="round"
            strokeWidth="16"
          />
        </svg>
        <span
          className={`relative text-center font-bold leading-none text-text-primary ${percentageClassName}`}
        >
          {percentage}%
        </span>
      </div>
    </section>
  );
}

function ResumeCard({
  extractionPending,
  extractionStatus,
  fileName,
  hasResume,
  onExtract,
  onFileChange,
}: {
  extractionPending: boolean;
  extractionStatus: ExtractionStatus | null;
  fileName: string;
  hasResume: boolean;
  onExtract: () => void;
  onFileChange: (file: File | null) => void;
}): React.ReactNode {
  return (
    <Card>
      <h2 className="text-[22px] font-bold leading-7 text-text-primary">
        Resume
      </h2>
      <p className="mt-2 text-[16px] font-medium leading-6 text-text-secondary">
        Upload an existing resume, extract its details, then review everything
        before saving.
      </p>

      <div className="mt-8 flex min-h-[252px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-secondary px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface shadow-sm">
          <span className="text-[14px] font-bold leading-none text-accent">
            up
          </span>
        </div>
        <p className="mt-6 text-[18px] font-bold leading-6 text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-2 text-[16px] font-medium leading-6 text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <label
          htmlFor="resume"
          className="mt-7 cursor-pointer rounded-xl border border-border bg-surface px-8 py-3 text-[16px] font-bold leading-6 text-text-dark shadow-sm"
        >
          Select Resume
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="sr-only"
        />
        <p className="mt-4 text-[12px] font-medium leading-4 text-text-muted">
          {fileName || (hasResume ? "Resume on file" : "No resume uploaded")}
        </p>
      </div>

      {extractionStatus ? (
        <p
          aria-live="polite"
          className={`mt-6 rounded-lg border px-4 py-3 text-[14px] font-medium leading-5 ${
            extractionStatus.success
              ? "border-success/20 bg-success-lightest text-success-foreground"
              : "border-error/20 bg-error/5 text-error"
          }`}
        >
          {extractionStatus.message}
        </p>
      ) : null}

      {fileName ? (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-surface-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] font-medium leading-5 text-text-secondary">
            Fill empty profile fields from this PDF.
          </p>
          <button
            type="button"
            onClick={onExtract}
            disabled={extractionPending}
            className="rounded-xl bg-accent px-6 py-3 text-[14px] font-bold leading-5 text-accent-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {extractionPending ? "Extracting..." : "Extract from Resume"}
          </button>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[16px] font-medium leading-6 text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          className="rounded-xl bg-accent px-8 py-3 text-[16px] font-bold leading-6 text-accent-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          disabled
        >
          Generate Resume from Profile
        </button>
      </div>
    </Card>
  );
}

function WorkExperience({
  roles,
  onRolesChange,
}: {
  roles: WorkExperienceRole[];
  onRolesChange: (roles: WorkExperienceRole[]) => void;
}): React.ReactNode {
  const visibleRoles = roles.length > 0 ? roles : [emptyWorkExperienceRole];

  function updateRole(
    index: number,
    field: keyof WorkExperienceRole,
    value: string | boolean,
  ): void {
    onRolesChange(
      visibleRoles.map((role, roleIndex) =>
        roleIndex === index ? { ...role, [field]: value } : role,
      ),
    );
  }

  function addRole(): void {
    if (visibleRoles.length >= 3) {
      return;
    }

    onRolesChange([...visibleRoles, emptyWorkExperienceRole]);
  }

  function removeRole(index: number): void {
    onRolesChange(visibleRoles.filter((_, roleIndex) => roleIndex !== index));
  }

  return (
    <FormSection id="work-experience-section" title="Work Experience">
      <input
        type="hidden"
        name="work_experience"
        value={JSON.stringify(visibleRoles)}
      />
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="sr-only">Work experience entries</span>
        <button
          type="button"
          onClick={addRole}
          disabled={visibleRoles.length >= 3}
          className="ml-auto text-[16px] font-bold leading-6 text-accent disabled:cursor-not-allowed disabled:text-text-muted"
        >
          + Add role
        </button>
      </div>

      <div className="space-y-6">
        {visibleRoles.map((role, index) => (
          <div
            key={`role-${index}`}
            className="rounded-xl border border-border bg-surface-secondary p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-[14px] font-bold leading-5 text-text-primary">
                Role {index + 1}
              </p>
              {visibleRoles.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRole(index)}
                  className="text-[14px] font-bold leading-5 text-error"
                >
                  Remove
                </button>
              ) : null}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label
                  htmlFor={`company_name_${index}`}
                  className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
                >
                  Company Name
                </label>
                <input
                  id={`company_name_${index}`}
                  value={role.companyName}
                  onChange={(event) =>
                    updateRole(index, "companyName", event.target.value)
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label
                  htmlFor={`job_title_${index}`}
                  className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
                >
                  Job Title
                </label>
                <input
                  id={`job_title_${index}`}
                  value={role.jobTitle}
                  onChange={(event) =>
                    updateRole(index, "jobTitle", event.target.value)
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label
                  htmlFor={`start_date_${index}`}
                  className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
                >
                  Start Date
                </label>
                <input
                  id={`start_date_${index}`}
                  value={role.startDate}
                  onChange={(event) =>
                    updateRole(index, "startDate", event.target.value)
                  }
                  placeholder="January 2022"
                  className={inputClassName}
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor={`end_date_${index}`}
                    className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
                  >
                    End Date
                  </label>
                  <label className="flex items-center gap-2 text-[12px] font-bold leading-4 text-text-dark">
                    <input
                      type="checkbox"
                      checked={role.isCurrent}
                      onChange={(event) =>
                        updateRole(index, "isCurrent", event.target.checked)
                      }
                      className="size-4 accent-info-medium"
                    />
                    Currently working here
                  </label>
                </div>
                <input
                  id={`end_date_${index}`}
                  value={role.endDate}
                  onChange={(event) =>
                    updateRole(index, "endDate", event.target.value)
                  }
                  placeholder={role.isCurrent ? "Present" : "June 2024"}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="mt-6">
              <label
                htmlFor={`responsibilities_${index}`}
                className="block text-[12px] font-bold uppercase leading-4 text-text-dark"
              >
                Key Responsibilities
              </label>
              <textarea
                id={`responsibilities_${index}`}
                value={role.responsibilities}
                onChange={(event) =>
                  updateRole(index, "responsibilities", event.target.value)
                }
                rows={4}
                className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-[16px] font-medium leading-6 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}

export function ProfileForm({ profile }: ProfileFormProps): React.ReactNode {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveProfile,
    initialSaveProfileState,
  );
  const [formValues, setFormValues] = useState<ProfileScalarFields>(
    createProfileScalarFields(profile),
  );
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [skillInput, setSkillInput] = useState("");
  const [industries, setIndustries] = useState<string[]>(profile.industries);
  const [industryInput, setIndustryInput] = useState("");
  const [jobTitles, setJobTitles] = useState<string[]>(
    profile.jobTitlesSeeking,
  );
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>(
    profile.preferredLocations,
  );
  const [preferredLocationInput, setPreferredLocationInput] = useState("");
  const [workExperience, setWorkExperience] = useState<WorkExperienceRole[]>(
    profile.workExperience,
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractionPending, setExtractionPending] = useState(false);
  const [extractionStatus, setExtractionStatus] =
    useState<ExtractionStatus | null>(null);

  useEffect(() => {
    if (state.success && state.savedAt) {
      router.refresh();
    }
  }, [router, state.savedAt, state.success]);

  function updateFormValue<Key extends keyof ProfileScalarFields>(
    key: Key,
    value: ProfileScalarFields[Key],
  ): void {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  function updateEducationValue(
    key: keyof ProfileScalarFields["education"],
    value: string,
  ): void {
    setFormValues((currentValues) => ({
      ...currentValues,
      education: {
        ...currentValues.education,
        [key]: value,
      },
    }));
  }

  function fillEmptyFields(extraction: ProfileExtraction): void {
    setFormValues((currentValues) => ({
      ...currentValues,
      currentTitle: currentValues.currentTitle || extraction.currentTitle,
      education: {
        fieldOfStudy:
          currentValues.education.fieldOfStudy ||
          extraction.education.fieldOfStudy,
        graduationYear:
          currentValues.education.graduationYear ||
          extraction.education.graduationYear,
        highestDegree:
          currentValues.education.highestDegree ||
          extraction.education.highestDegree,
        institutionName:
          currentValues.education.institutionName ||
          extraction.education.institutionName,
      },
      experienceLevel:
        currentValues.experienceLevel || extraction.experienceLevel,
      fullName: currentValues.fullName || extraction.fullName,
      linkedinUrl: currentValues.linkedinUrl || extraction.linkedinUrl,
      location: currentValues.location || extraction.location,
      phone: currentValues.phone || extraction.phone,
      portfolioUrl: currentValues.portfolioUrl || extraction.portfolioUrl,
      yearsExperience:
        currentValues.yearsExperience || extraction.yearsExperience,
    }));
    setSkills((currentItems) =>
      currentItems.length > 0 ? currentItems : extraction.skills,
    );
    setIndustries((currentItems) =>
      currentItems.length > 0 ? currentItems : extraction.industries,
    );
    setJobTitles((currentItems) =>
      currentItems.length > 0 ? currentItems : extraction.jobTitlesSeeking,
    );
    setWorkExperience((currentRoles) =>
      hasWorkExperienceContent(currentRoles)
        ? currentRoles
        : extraction.workExperience,
    );
  }

  function handleFileChange(file: File | null): void {
    setResumeFile(file);
    setExtractionStatus(null);
  }

  async function handleExtract(): Promise<void> {
    if (!resumeFile || extractionPending) {
      return;
    }

    setExtractionPending(true);
    setExtractionStatus(null);

    try {
      const extractionFormData = new FormData();
      extractionFormData.set("resume", resumeFile);
      const response = await fetch("/api/resume/extract", {
        body: extractionFormData,
        method: "POST",
      });
      const result: unknown = await response.json();
      const parsedResult = profileExtractionResponseSchema.safeParse(result);

      if (!parsedResult.success) {
        setExtractionStatus({
          message: "We could not process this resume. Please try again.",
          success: false,
        });
        return;
      }

      if (!response.ok || !parsedResult.data.success) {
        setExtractionStatus({
          message:
            parsedResult.data.success === false
              ? parsedResult.data.error
              : "We could not process this resume. Please try again.",
          success: false,
        });
        return;
      }

      fillEmptyFields(parsedResult.data.data);
      setExtractionStatus({
        message:
          "Resume details added to empty fields. Review them before saving.",
        success: true,
      });
    } catch (error) {
      console.error("[components/profile/ProfileForm] extract resume", error);
      setExtractionStatus({
        message: "We could not process this resume. Please try again.",
        success: false,
      });
    } finally {
      setExtractionPending(false);
    }
  }

  return (
    <>
      <AttentionBanner
        missingFields={profile.missingFields}
        percentage={profile.percentage}
      />
      <form action={formAction} className="space-y-8">
        <ResumeCard
          extractionPending={extractionPending}
          extractionStatus={extractionStatus}
          fileName={resumeFile?.name ?? ""}
          hasResume={Boolean(profile.resumePdfUrl)}
          onExtract={() => void handleExtract()}
          onFileChange={handleFileChange}
        />

        <Card>
          <h2 className="text-[22px] font-bold leading-7 text-text-primary">
            Profile Information
          </h2>
          <p className="mt-2 text-[16px] font-medium leading-6 text-text-secondary">
            This context is used to accurately represent you in agent
            interactions.
          </p>

          {state.message ? (
            <p
              aria-live="polite"
              className={`mt-6 rounded-lg border border-border bg-surface-secondary px-4 py-3 text-[14px] font-medium leading-5 ${
                state.success ? "text-success-foreground" : "text-error"
              }`}
            >
              {state.message}
            </p>
          ) : null}

          <div className="mt-6 space-y-16 border-t border-border pt-16">
            <FormSection id="personal-info-section" title="Personal Info">
              <div className="grid gap-6 lg:grid-cols-2">
                <TextField
                  name="full_name"
                  label="Full Name"
                  value={formValues.fullName}
                  onChange={(value) => updateFormValue("fullName", value)}
                />
                <TextField
                  name="email"
                  label="Email"
                  value={formValues.email}
                  onChange={(value) => updateFormValue("email", value)}
                  type="email"
                />
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={formValues.phone}
                  onChange={(value) => updateFormValue("phone", value)}
                  placeholder="+1 (555) 000-0000"
                />
                <TextField
                  name="location"
                  label="Location"
                  value={formValues.location}
                  onChange={(value) => updateFormValue("location", value)}
                  placeholder="City, Country"
                />
                <TextField
                  name="linkedin_url"
                  label="LinkedIn URL"
                  value={formValues.linkedinUrl}
                  onChange={(value) => updateFormValue("linkedinUrl", value)}
                  placeholder="https://linkedin.com/in/you"
                />
                <TextField
                  name="portfolio_url"
                  label="Portfolio / GitHub"
                  value={formValues.portfolioUrl}
                  onChange={(value) => updateFormValue("portfolioUrl", value)}
                  placeholder="https://github.com/you"
                />
                <SelectField
                  name="work_authorization"
                  label="Work Authorization"
                  value={formValues.workAuthorization}
                  onChange={(value) =>
                    updateFormValue("workAuthorization", value)
                  }
                  options={workAuthorizationOptions}
                  className="lg:col-span-2"
                />
              </div>
            </FormSection>

            <FormSection
              id="professional-info-section"
              title="Professional Info"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <TextField
                  name="current_title"
                  label="Current/Recent Job Title"
                  value={formValues.currentTitle}
                  onChange={(value) => updateFormValue("currentTitle", value)}
                  placeholder="Frontend Engineer"
                  className="lg:col-span-2"
                />
                <SelectField
                  name="experience_level"
                  label="Experience Level"
                  value={formValues.experienceLevel}
                  onChange={(value) =>
                    updateFormValue("experienceLevel", value)
                  }
                  options={experienceLevelOptions}
                />
                <TextField
                  name="years_experience"
                  label="Years of Experience"
                  value={formValues.yearsExperience}
                  onChange={(value) =>
                    updateFormValue("yearsExperience", value)
                  }
                  type="number"
                />
                <div className="lg:col-span-2">
                  <AddableList
                    name="skills"
                    label="Skills"
                    placeholder="Add a skill"
                    items={skills}
                    inputValue={skillInput}
                    onInputChange={setSkillInput}
                    onAdd={() => {
                      setSkills(addListItem(skills, skillInput));
                      setSkillInput("");
                    }}
                    onRemove={(item) =>
                      setSkills(skills.filter((skill) => skill !== item))
                    }
                  />
                </div>
                <div className="lg:col-span-2">
                  <AddableList
                    name="industries"
                    label="Industries Worked In (Optional)"
                    placeholder="E.g. FinTech, Healthcare"
                    items={industries}
                    inputValue={industryInput}
                    onInputChange={setIndustryInput}
                    onAdd={() => {
                      setIndustries(addListItem(industries, industryInput));
                      setIndustryInput("");
                    }}
                    onRemove={(item) =>
                      setIndustries(
                        industries.filter((industry) => industry !== item),
                      )
                    }
                  />
                </div>
              </div>
            </FormSection>

            <WorkExperience
              roles={workExperience}
              onRolesChange={setWorkExperience}
            />

            <FormSection id="education-section" title="Education">
              <div className="grid gap-6 lg:grid-cols-2">
                <TextField
                  name="highest_degree"
                  label="Highest Degree"
                  value={formValues.education.highestDegree}
                  onChange={(value) =>
                    updateEducationValue("highestDegree", value)
                  }
                  placeholder="Bachelor's"
                />
                <TextField
                  name="field_of_study"
                  label="Field of Study"
                  value={formValues.education.fieldOfStudy}
                  onChange={(value) =>
                    updateEducationValue("fieldOfStudy", value)
                  }
                  placeholder="Computer Science"
                />
                <TextField
                  name="institution_name"
                  label="Institution Name"
                  value={formValues.education.institutionName}
                  onChange={(value) =>
                    updateEducationValue("institutionName", value)
                  }
                  placeholder="E.g. State University"
                />
                <TextField
                  name="graduation_year"
                  label="Graduation Year"
                  value={formValues.education.graduationYear}
                  onChange={(value) =>
                    updateEducationValue("graduationYear", value)
                  }
                  placeholder="YYYY"
                />
              </div>
            </FormSection>

            <FormSection id="job-preferences-section" title="Job Preferences">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <AddableList
                    name="job_titles_seeking"
                    label="Job Titles Seeking"
                    placeholder="Frontend Engineer"
                    items={jobTitles}
                    inputValue={jobTitleInput}
                    onInputChange={setJobTitleInput}
                    onAdd={() => {
                      setJobTitles(addListItem(jobTitles, jobTitleInput));
                      setJobTitleInput("");
                    }}
                    onRemove={(item) =>
                      setJobTitles(
                        jobTitles.filter((jobTitle) => jobTitle !== item),
                      )
                    }
                  />
                </div>
                <SelectField
                  name="remote_preference"
                  label="Remote Preference"
                  value={formValues.remotePreference}
                  onChange={(value) =>
                    updateFormValue("remotePreference", value)
                  }
                  options={remotePreferenceOptions}
                />
                <TextField
                  name="salary_expectation"
                  label="Salary Expectation (Optional)"
                  value={formValues.salaryExpectation}
                  onChange={(value) =>
                    updateFormValue("salaryExpectation", value)
                  }
                  placeholder="E.g. $120k+"
                />
                <div className="lg:col-span-2">
                  <AddableList
                    name="preferred_locations"
                    label="Preferred Locations (Optional)"
                    placeholder="E.g. New York, London"
                    items={preferredLocations}
                    inputValue={preferredLocationInput}
                    onInputChange={setPreferredLocationInput}
                    onAdd={() => {
                      setPreferredLocations(
                        addListItem(preferredLocations, preferredLocationInput),
                      );
                      setPreferredLocationInput("");
                    }}
                    onRemove={(item) =>
                      setPreferredLocations(
                        preferredLocations.filter((location) => location !== item),
                      )
                    }
                  />
                </div>
                <SelectField
                  name="cover_letter_tone"
                  label="Cover Letter Tone"
                  value={formValues.coverLetterTone}
                  onChange={(value) =>
                    updateFormValue("coverLetterTone", value)
                  }
                  options={coverLetterToneOptions}
                  className="lg:col-span-2"
                />
              </div>
            </FormSection>

            <div className="border-t border-border pt-8">
              <button
                type="submit"
                disabled={pending}
                className="h-12 w-full rounded-xl bg-accent text-[16px] font-bold leading-6 text-accent-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pending ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </Card>
      </form>
    </>
  );
}
