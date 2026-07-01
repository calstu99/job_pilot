import { z } from "zod";
import type {
  AdzunaJob,
  SupportedAdzunaCountry,
} from "@/agent/types";

const adzunaJobSchema = z.object({
  category: z
    .object({
      label: z.string().optional(),
      tag: z.string().optional(),
    })
    .optional(),
  company: z
    .object({
      display_name: z.string().optional(),
    })
    .optional(),
  contract_time: z.string().optional(),
  contract_type: z.string().optional(),
  created: z.string().optional(),
  description: z.string().optional(),
  id: z.union([z.string(), z.number().transform(String)]).optional(),
  location: z
    .object({
      display_name: z.string().optional(),
    })
    .optional(),
  redirect_url: z.string().url().optional(),
  salary_is_predicted: z.enum(["0", "1"]).optional(),
  salary_max: z.number().finite().optional(),
  salary_min: z.number().finite().optional(),
  title: z.string().optional(),
});

const adzunaResponseSchema = z.object({
  results: z.array(adzunaJobSchema).default([]),
});

export class AdzunaSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdzunaSearchError";
  }
}

export function detectAdzunaCountry(
  location: string,
): SupportedAdzunaCountry {
  const normalized = location.trim().toLowerCase();

  const countryPatterns: Array<{
    code: SupportedAdzunaCountry;
    pattern: RegExp;
  }> = [
    {
      code: "gb",
      pattern:
        /(?:^|[\s,])(uk|u\.k\.|united kingdom|great britain|england|scotland|wales|northern ireland)(?:$|[\s,])/i,
    },
    {
      code: "ca",
      pattern: /(?:^|[\s,])(ca|canada)(?:$|[\s,])/i,
    },
    {
      code: "au",
      pattern: /(?:^|[\s,])(au|australia)(?:$|[\s,])/i,
    },
    {
      code: "us",
      pattern:
        /(?:^|[\s,])(us|u\.s\.|usa|united states|united states of america)(?:$|[\s,])/i,
    },
  ];

  return (
    countryPatterns.find(({ pattern }) => pattern.test(normalized))?.code ??
    "us"
  );
}

export async function searchAdzunaJobs(
  jobTitle: string,
  location: string,
  country = detectAdzunaCountry(location),
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.error("[lib/adzuna] missing Adzuna credentials");
    throw new AdzunaSearchError("Adzuna is not configured.");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    category: "it-jobs",
    "content-type": "application/json",
    results_per_page: "10",
    what: jobTitle,
  });

  if (location) {
    params.set("where", location);
  }

  let response: Response;

  try {
    response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      },
    );
  } catch (error) {
    console.error("[lib/adzuna] request failed", error);
    throw new AdzunaSearchError("Adzuna could not be reached.");
  }

  if (!response.ok) {
    console.error("[lib/adzuna] response status", response.status);
    throw new AdzunaSearchError("Adzuna returned an unsuccessful response.");
  }

  try {
    const parsed = adzunaResponseSchema.safeParse(await response.json());

    if (!parsed.success) {
      console.error("[lib/adzuna] invalid response", parsed.error);
      throw new AdzunaSearchError("Adzuna returned an invalid response.");
    }

    return parsed.data.results;
  } catch (error) {
    if (error instanceof AdzunaSearchError) {
      throw error;
    }

    console.error("[lib/adzuna] response parsing failed", error);
    throw new AdzunaSearchError("Adzuna returned an invalid response.");
  }
}
