export function JobActions({ applyUrl, company }: { applyUrl: string | null; company: string }): React.ReactNode {
  return applyUrl ? (
    <a href={applyUrl} target="_blank" rel="noreferrer" className="block rounded-md bg-accent px-4 py-3 text-center text-[14px] font-medium leading-5 text-accent-foreground transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
      Apply Now at {company}
    </a>
  ) : (
    <p className="rounded-md border border-border bg-surface px-4 py-3 text-center text-[14px] font-medium leading-5 text-text-muted">An application link is not available for this job.</p>
  );
}
