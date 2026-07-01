import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type {
  CompanyResearchDossier,
  JobForResearch,
  ProfileForResearch,
} from "@/agent/types";
import { createResearchBrowserSession } from "@/lib/browserbase";
import { createResearchStagehand } from "@/lib/stagehand";

const homepageSchema = z.object({
  oneLiner: z.string().max(500),
  pageLinks: z
    .array(
      z.object({
        kind: z.enum([
          "about",
          "careers",
          "blog",
          "engineering",
          "product",
          "team",
          "other",
        ]),
        url: z.string().min(1).max(2048),
      }),
    )
    .max(20),
  productSummary: z.string().max(1200),
  signals: z.array(z.string().max(300)).max(12),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string().max(400)).max(12),
  notable: z.array(z.string().max(300)).max(10),
  technologies: z.array(z.string().max(100)).max(20),
  valuesOrCulture: z.array(z.string().max(300)).max(12),
});

export const companyResearchDossierSchema = z.object({
  companyOverview: z.string().min(1).max(1200),
  culture: z.array(z.string().min(1).max(300)).max(8),
  gapsToAddress: z.array(z.string().min(1).max(350)).max(8),
  interviewPrep: z.array(z.string().min(1).max(350)).max(8),
  smartQuestions: z.array(z.string().min(1).max(350)).max(8),
  sources: z.array(z.string().max(2048)).max(4),
  techStack: z.array(z.string().min(1).max(100)).max(20),
  whyThisRole: z.string().min(1).max(1000),
  yourEdge: z.array(z.string().min(1).max(350)).max(8),
});

type WebsiteResearch = {
  homepage: z.infer<typeof homepageSchema> | null;
  pages: Array<{
    data: z.infer<typeof subPageSchema>;
    url: string;
  }>;
  sources: string[];
};

const preferredKinds = new Map([
  ["about", 0],
  ["blog", 1],
  ["engineering", 2],
  ["product", 3],
  ["team", 4],
  ["careers", 5],
  ["other", 6],
]);

function normalizeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function rootHostname(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, "").split(".");
  const secondLevelSuffixes = new Set([
    "co.uk",
    "com.au",
    "com.br",
    "com.sg",
    "co.nz",
    "co.jp",
    "co.in",
  ]);
  const lastTwo = parts.slice(-2).join(".");

  return secondLevelSuffixes.has(lastTwo) && parts.length >= 3
    ? parts.slice(-3).join(".")
    : parts.slice(-2).join(".");
}

function fallbackHomepage(company: string): string {
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://www.${slug || "company"}.com/`;
}

async function discoverHomepage(
  sourceUrl: string | null,
  company: string,
): Promise<string> {
  const safeSourceUrl = sourceUrl ? normalizeHttpUrl(sourceUrl) : null;

  if (!safeSourceUrl) {
    return fallbackHomepage(company);
  }

  try {
    const response = await fetch(safeSourceUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    const finalUrl = new URL(response.url);

    if (
      finalUrl.hostname.toLowerCase().includes("adzuna.") ||
      !["http:", "https:"].includes(finalUrl.protocol)
    ) {
      return fallbackHomepage(company);
    }

    return `https://${rootHostname(finalUrl.hostname)}/`;
  } catch (error) {
    console.error("[agent/research] discover homepage", error);
    return fallbackHomepage(company);
  }
}

function selectSubPages(
  links: z.infer<typeof homepageSchema>["pageLinks"],
  homepageUrl: string,
): string[] {
  const homepage = new URL(homepageUrl);
  const seen = new Set<string>();

  return [...links]
    .sort(
      (left, right) =>
        (preferredKinds.get(left.kind) ?? 99) -
        (preferredKinds.get(right.kind) ?? 99),
    )
    .flatMap((link) => {
      const normalized = normalizeHttpUrl(link.url);

      if (!normalized) return [];

      const url = new URL(normalized);

      if (
        rootHostname(url.hostname) !== rootHostname(homepage.hostname) ||
        seen.has(url.toString())
      ) {
        return [];
      }

      seen.add(url.toString());
      return [url.toString()];
    })
    .slice(0, 3);
}

async function browseCompanyWebsite(
  homepageUrl: string,
): Promise<WebsiteResearch> {
  const result: WebsiteResearch = { homepage: null, pages: [], sources: [] };
  let stagehand: ReturnType<typeof createResearchStagehand> | null = null;

  try {
    const sessionId = await createResearchBrowserSession();
    stagehand = createResearchStagehand(sessionId);
    await stagehand.init();
    const page = stagehand.context.activePage();

    if (!page) {
      throw new Error("Stagehand did not provide an active page.");
    }

    await page.goto(homepageUrl, {
      timeoutMs: 25_000,
      waitUntil: "domcontentloaded",
    });
    result.homepage = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it is for, and concrete signals such as customers, scale, mission, or recent launches. Return empty strings or arrays when evidence is absent. Find internal links most useful for researching the company as an employer.",
      homepageSchema,
    );
    result.sources.push(homepageUrl);

    if (!result.homepage.oneLiner && !result.homepage.productSummary) {
      return result;
    }

    const subPages = selectSubPages(result.homepage.pageLinks, homepageUrl);

    for (const url of subPages) {
      try {
        await page.goto(url, {
          timeoutMs: 20_000,
          waitUntil: "domcontentloaded",
        });
        const data = await stagehand.extract(
          "Extract evidence useful to a job candidate: what the company does, values and working style, specific technologies, notable projects or customers, and how the team operates. Ignore navigation, footers, cookie banners, and generic marketing copy. Return empty arrays when evidence is absent.",
          subPageSchema,
        );
        result.pages.push({ data, url });
        result.sources.push(url);
      } catch (error) {
        console.error("[agent/research] extract sub-page", { error, url });
      }
    }

    return result;
  } catch (error) {
    console.error("[agent/research] browse company website", error);
    return result;
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (error) {
        console.error("[agent/research] close Stagehand", error);
      }
    }
  }
}

async function synthesizeDossier({
  job,
  profile,
  websiteResearch,
}: {
  job: JobForResearch;
  profile: ProfileForResearch;
  websiteResearch: WebsiteResearch;
}): Promise<CompanyResearchDossier> {
  const openai = new OpenAI();
  const response = await openai.responses.parse({
    input: [
      {
        role: "system",
        content: `You are a sharp career strategist preparing one candidate for one role.

Ground every company claim in the supplied website research or job posting. Never invent facts. When website evidence is thin, clearly describe job-posting-based conclusions as inferences. Connect the candidate's real experience to the role, frame skill gaps honestly through adjacent experience and preparation, and make questions specific to supplied evidence. Keep every list item to one or two sentences. Use only the supplied visitedSources in sources. Return empty techStack and culture arrays when there is no evidence for them, but always provide useful candidate-specific strategy fields.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          candidateProfile: profile,
          jobPosting: job,
          visitedSources: websiteResearch.sources,
          websiteResearch: {
            homepage: websiteResearch.homepage,
            pages: websiteResearch.pages,
          },
        }),
      },
    ],
    max_output_tokens: 1200,
    model: "gpt-4o",
    text: {
      format: zodTextFormat(
        companyResearchDossierSchema,
        "company_research_dossier",
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no parsed company dossier.");
  }

  return {
    ...response.output_parsed,
    sources: websiteResearch.sources,
  };
}

export async function researchCompany({
  job,
  profile,
}: {
  job: JobForResearch;
  profile: ProfileForResearch;
}): Promise<
  | {
      browserEvidenceFound: boolean;
      dossier: CompanyResearchDossier;
      success: true;
    }
  | { error: string; success: false }
> {
  try {
    const homepageUrl = await discoverHomepage(job.sourceUrl, job.company);
    const websiteResearch = await browseCompanyWebsite(homepageUrl);
    const dossier = await synthesizeDossier({
      job,
      profile,
      websiteResearch,
    });
    return {
      browserEvidenceFound: Boolean(
        websiteResearch.homepage?.oneLiner ||
          websiteResearch.homepage?.productSummary,
      ),
      dossier,
      success: true,
    };
  } catch (error) {
    console.error("[agent/research] research company", error);
    return {
      error: "We could not complete this company research. Please try again.",
      success: false,
    };
  }
}
