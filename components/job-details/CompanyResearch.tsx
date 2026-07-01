"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanyResearchDossier } from "@/agent/types";
import type { CompanyResearchResponse } from "@/lib/company-research";

type Props = {
  company: string;
  initialDossier: CompanyResearchDossier | null;
  jobId: string;
};

function ResearchList({
  emptyText,
  items,
}: {
  emptyText: string;
  items: string[];
}): React.ReactNode {
  if (items.length === 0) {
    return (
      <p className="text-[14px] font-normal leading-6 text-text-muted">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[14px] font-normal leading-6 text-text-secondary"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CompanyResearch({
  company,
  initialDossier,
  jobId,
}: Props): React.ReactNode {
  const router = useRouter();
  const [dossier, setDossier] = useState(initialDossier);
  const [error, setError] = useState("");
  const [isResearching, setIsResearching] = useState(false);

  async function handleResearch(): Promise<void> {
    setError("");
    setIsResearching(true);

    try {
      const response = await fetch("/api/agent/research", {
        body: JSON.stringify({ jobId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body: unknown = await response.json();

      if (!body || typeof body !== "object") {
        setError("We could not complete this research. Please try again.");
        return;
      }

      const result = body as CompanyResearchResponse;

      if (!response.ok || !result.success) {
        setError(
          result.success
            ? "We could not complete this research. Please try again."
            : result.error,
        );
        return;
      }

      setDossier(result.data.dossier);
      router.refresh();
    } catch (requestError) {
      console.error("[CompanyResearch] handleResearch", requestError);
      setError("We could not complete this research. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[16px] font-semibold leading-6 text-text-primary">
          <span className="mr-3 inline-grid size-8 place-items-center rounded-full bg-accent-muted text-accent">
            ▥
          </span>
          Company Research
        </h2>
        <button
          type="button"
          disabled={isResearching}
          onClick={handleResearch}
          className="rounded-md bg-accent px-4 py-2.5 text-[14px] font-medium leading-5 text-accent-foreground transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResearching
            ? "Researching…"
            : dossier
              ? "Research Again"
              : "⌕ Research Company"}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mx-6 mt-6 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-[14px] font-normal leading-5 text-error"
        >
          {error}
        </div>
      ) : null}

      {!dossier ? (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-surface-secondary text-[22px] text-text-muted">
              ▥
            </span>
            <p className="mt-4 text-[14px] font-semibold leading-5 text-text-primary">
              {isResearching ? "Research in progress" : "No research yet"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[14px] font-normal leading-5 text-text-muted">
              {isResearching
                ? `The AI is reviewing ${company} and preparing your candidate-specific dossier. This can take a minute or two.`
                : `Click “Research Company” to let the AI browse ${company}’s public pages and build a dossier.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 p-6 sm:p-7">
          <section>
            <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
              Company Overview
            </h3>
            <p className="mt-2 text-[14px] font-normal leading-6 text-text-secondary">
              {dossier.companyOverview}
            </p>
          </section>

          <div className="grid gap-8 sm:grid-cols-2">
            <section>
              <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
                Tech Stack
              </h3>
              {dossier.techStack.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dossier.techStack.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full bg-accent-muted px-2.5 py-1 text-[12px] font-medium leading-4 text-accent"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[14px] font-normal leading-6 text-text-muted">
                  No verified technologies were found.
                </p>
              )}
            </section>
            <section>
              <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
                Culture
              </h3>
              <div className="mt-2">
                <ResearchList
                  emptyText="No specific culture evidence was found."
                  items={dossier.culture}
                />
              </div>
            </section>
          </div>

          <section>
            <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
              Why This Role
            </h3>
            <p className="mt-2 text-[14px] font-normal leading-6 text-text-secondary">
              {dossier.whyThisRole}
            </p>
          </section>

          <div className="grid gap-6 rounded-xl border border-accent-light bg-accent-muted p-5 sm:grid-cols-2">
            <section>
              <h3 className="text-[14px] font-semibold leading-5 text-accent">
                Your Edge
              </h3>
              <div className="mt-3">
                <ResearchList
                  emptyText="No candidate-specific strengths were identified."
                  items={dossier.yourEdge}
                />
              </div>
            </section>
            <section>
              <h3 className="text-[14px] font-semibold leading-5 text-accent">
                Gaps to Address
              </h3>
              <div className="mt-3">
                <ResearchList
                  emptyText="No material skill gaps were identified."
                  items={dossier.gapsToAddress}
                />
              </div>
            </section>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <section>
              <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
                Smart Questions
              </h3>
              <div className="mt-2">
                <ResearchList
                  emptyText="No evidence-based questions were generated."
                  items={dossier.smartQuestions}
                />
              </div>
            </section>
            <section>
              <h3 className="text-[14px] font-semibold leading-5 text-text-primary">
                Interview Prep
              </h3>
              <div className="mt-2">
                <ResearchList
                  emptyText="No additional preparation topics were generated."
                  items={dossier.interviewPrep}
                />
              </div>
            </section>
          </div>

          <section className="border-t border-border pt-5">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary">
              Sources
            </h3>
            {dossier.sources.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {dossier.sources.map((source) => (
                  <a
                    key={source}
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-[12px] font-medium leading-4 text-accent hover:text-accent-dark"
                  >
                    {source}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[12px] font-normal leading-4 text-text-muted">
                This briefing was prepared from the saved job and profile data.
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
