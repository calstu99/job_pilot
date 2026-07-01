type MatchTone = "high" | "medium" | "low";

type MockJob = {
  company: string;
  dateFound: string;
  role: string;
  salary: string;
  score: number;
  tone: MatchTone;
};

const mockJobs: MockJob[] = [
  {
    company: "Vercel",
    dateFound: "2 hours ago",
    role: "Senior Frontend Engineer",
    salary: "$160k - $200k",
    score: 94,
    tone: "high",
  },
  {
    company: "Stripe",
    dateFound: "Yesterday",
    role: "Staff UI Engineer",
    salary: "$180k - $240k",
    score: 88,
    tone: "medium",
  },
  {
    company: "Linear",
    dateFound: "Yesterday",
    role: "Product Engineer",
    salary: "$150k - $190k",
    score: 96,
    tone: "high",
  },
  {
    company: "Notion",
    dateFound: "2 days ago",
    role: "Frontend Developer",
    salary: "$130k - $170k",
    score: 72,
    tone: "low",
  },
  {
    company: "OpenAI",
    dateFound: "3 days ago",
    role: "Design Engineer",
    salary: "$200k - $280k",
    score: 91,
    tone: "high",
  },
  {
    company: "Figma",
    dateFound: "4 days ago",
    role: "Software Engineer, Editor",
    salary: "$170k - $220k",
    score: 85,
    tone: "medium",
  },
];

const matchToneClasses: Record<MatchTone, string> = {
  high: "bg-success",
  low: "bg-warning",
  medium: "bg-info-medium",
};

function CompanyIcon(): React.ReactNode {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-secondary text-text-secondary">
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 20V9.5h6V20M11 20V4h8v16M3 20h18M7.5 12h1M7.5 15h1M14 8h2M14 11h2M14 14h2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    </span>
  );
}

function MatchScore({
  score,
  tone,
}: {
  score: number;
  tone: MatchTone;
}): React.ReactNode {
  return (
    <div
      aria-label={`${score}% match`}
      className="flex min-w-52 items-center gap-3"
    >
      <span className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
        <span
          className={`block h-full rounded-full ${matchToneClasses[tone]}`}
          style={{ width: `${score}%` }}
        />
      </span>
      <span className="text-[16px] font-semibold leading-6 text-text-dark">
        {score}%
      </span>
    </div>
  );
}

export function JobsTable(): React.ReactNode {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse text-left">
        <thead className="bg-surface-secondary">
          <tr className="border-b border-border">
            {["Company", "Role", "Match Score", "Salary Est.", "Date Found"].map(
              (heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-8 py-5 text-[12px] font-semibold uppercase leading-4 tracking-wide text-text-secondary"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {mockJobs.map((job) => (
            <tr
              key={`${job.company}-${job.role}`}
              className="border-b border-border bg-surface transition-colors last:border-b-0 hover:bg-surface-secondary"
            >
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <CompanyIcon />
                  <span className="text-[16px] font-semibold leading-6 text-text-primary">
                    {job.company}
                  </span>
                </div>
              </td>
              <td className="px-8 py-5 text-[16px] font-medium leading-6 text-text-dark">
                {job.role}
              </td>
              <td className="px-8 py-5">
                <MatchScore score={job.score} tone={job.tone} />
              </td>
              <td className="whitespace-nowrap px-8 py-5 text-[16px] font-normal leading-6 text-text-dark">
                {job.salary}
              </td>
              <td className="whitespace-nowrap px-8 py-5 text-[16px] font-normal leading-6 text-text-secondary">
                {job.dateFound}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
