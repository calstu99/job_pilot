export type SupportedAdzunaCountry = "au" | "ca" | "gb" | "us";

export type AdzunaJob = {
  category?: {
    label?: string;
    tag?: string;
  };
  company?: {
    display_name?: string;
  };
  contract_time?: string;
  contract_type?: string;
  created?: string;
  description?: string;
  id?: string;
  location?: {
    display_name?: string;
  };
  redirect_url?: string;
  salary_is_predicted?: "0" | "1";
  salary_max?: number;
  salary_min?: number;
  title?: string;
};

export type ProfileForMatching = {
  currentTitle: string;
  experienceLevel: string;
  industries: string[];
  jobTitlesSeeking: string[];
  skills: string[];
  workExperience: unknown;
  yearsExperience: number | null;
};

export type JobMatch = {
  matchReason: string;
  matchedSkills: string[];
  matchScore: number;
  missingSkills: string[];
};

export type CompanyResearchDossier = {
  companyOverview: string;
  culture: string[];
  gapsToAddress: string[];
  interviewPrep: string[];
  smartQuestions: string[];
  sources: string[];
  techStack: string[];
  whyThisRole: string;
  yourEdge: string[];
};

export type ProfileForResearch = {
  currentTitle: string;
  experienceLevel: string;
  skills: string[];
  workExperience: unknown;
  yearsExperience: number | null;
};

export type JobForResearch = {
  company: string;
  description: string;
  matchedSkills: string[];
  missingSkills: string[];
  sourceUrl: string | null;
  title: string;
};
