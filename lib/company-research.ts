import type { CompanyResearchDossier } from "@/agent/types";

export type CompanyResearchSuccessResponse = {
  data: { dossier: CompanyResearchDossier };
  success: true;
};

export type CompanyResearchErrorResponse = {
  code?:
    | "INVALID_REQUEST"
    | "JOB_NOT_FOUND"
    | "RESEARCH_FAILED"
    | "UNAUTHENTICATED";
  error: string;
  success: false;
};

export type CompanyResearchResponse =
  | CompanyResearchErrorResponse
  | CompanyResearchSuccessResponse;
