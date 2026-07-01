type StatCardProps = {
  helper: string;
  label: string;
  trend?: string;
  value: string;
};

type ActivityItem = {
  color: "accent" | "info" | "success";
  label: string;
  time: string;
};

const activities: ActivityItem[] = [
  {
    color: "accent",
    label: "Found 8 jobs for Frontend Engineer",
    time: "10 mins ago",
  },
  { color: "info", label: "Researched Stripe", time: "1 hour ago" },
  {
    color: "success",
    label: "Found 12 jobs for React Developer",
    time: "2 hours ago",
  },
  { color: "accent", label: "Researched Vercel", time: "Yesterday" },
  {
    color: "success",
    label: "Found 10 jobs for Full Stack Engineer",
    time: "Yesterday",
  },
];

const activityDotClasses = {
  accent: "bg-accent ring-accent-light",
  info: "bg-info ring-info-light",
  success: "bg-success ring-success-light",
} satisfies Record<ActivityItem["color"], string>;

function StatCard({
  helper,
  label,
  trend,
  value,
}: StatCardProps): React.ReactNode {
  return (
    <article className="rounded-xl border border-border bg-surface px-6 py-7 shadow-sm sm:px-7">
      <p className="text-[14px] font-medium leading-5 text-text-secondary">
        {label}
      </p>
      <p className="mt-2 text-[36px] font-semibold leading-[44px] tracking-[-0.02em] text-text-primary">
        {value}
      </p>
      <div className="mt-3 flex min-h-7 items-center gap-3">
        {trend ? (
          <span className="rounded-md bg-success-lightest px-2 py-1 text-[13px] font-semibold leading-5 text-success-foreground">
            {trend}
          </span>
        ) : null}
        <span className="text-[13px] font-medium leading-5 text-text-muted">
          {helper}
        </span>
      </div>
    </article>
  );
}

function CardHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border px-6 py-5 sm:px-7">
      <h2 className="text-[18px] font-semibold leading-7 text-text-primary">
        {children}
      </h2>
    </div>
  );
}

function RecentActivity(): React.ReactNode {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm">
      <CardHeading>Recent Activity</CardHeading>
      <ol className="px-6 py-3 sm:px-7">
        {activities.map((activity, index) => (
          <li
            key={`${activity.label}-${activity.time}`}
            className="relative flex gap-5 py-4"
          >
            {index < activities.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-7 h-[calc(100%-14px)] w-px bg-border"
              />
            ) : null}
            <span
              aria-hidden="true"
              className={`relative mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ${activityDotClasses[activity.color]}`}
            />
            <div>
              <p className="text-[15px] font-semibold leading-6 text-text-primary">
                {activity.label}
              </p>
              <p className="mt-1 text-[13px] font-medium leading-5 text-text-muted">
                {activity.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ChartFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}): React.ReactNode {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <CardHeading>{title}</CardHeading>
      <div className="px-4 py-6 sm:px-6">{children}</div>
    </section>
  );
}

function CompanyResearchChart(): React.ReactNode {
  const bars = [2, 5, 3, 8, 12, 4, 1];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <ChartFrame title="Company Research Activity">
      <div
        role="img"
        aria-label="Company research activity by weekday: Monday 2, Tuesday 5, Wednesday 3, Thursday 8, Friday 12, Saturday 4, Sunday 1."
        className="grid min-h-[300px] grid-cols-[28px_1fr] gap-3"
      >
        <div className="flex flex-col justify-between pb-8 text-right text-[11px] font-medium text-text-muted">
          <span>12</span>
          <span>9</span>
          <span>6</span>
          <span>3</span>
          <span>0</span>
        </div>
        <div className="relative grid grid-cols-7 gap-3 border-b border-border pb-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-32px)] flex-col justify-between">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className="block border-t border-dashed border-border"
              />
            ))}
          </div>
          {bars.map((value, index) => (
            <div
              key={labels[index]}
              className="relative flex items-end justify-center"
            >
              <span
                aria-hidden="true"
                className="w-full max-w-10 rounded-t-md bg-info"
                style={{ height: `${(value / 12) * 100}%` }}
              />
              <span className="absolute -bottom-7 text-[11px] font-medium text-text-muted">
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
}

function JobsFoundChart(): React.ReactNode {
  return (
    <ChartFrame title="Jobs Found Over Time">
      <svg
        role="img"
        aria-labelledby="jobs-chart-title jobs-chart-description"
        viewBox="0 0 760 300"
        className="min-h-[280px] w-full"
      >
        <title id="jobs-chart-title">Jobs found over time</title>
        <desc id="jobs-chart-description">
          Jobs found rise from Monday to Tuesday, dip Wednesday, peak Friday,
          and decline through Sunday.
        </desc>
        <defs>
          <linearGradient id="jobs-area" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-accent)"
              stopOpacity="0.22"
            />
            <stop
              offset="100%"
              stopColor="var(--color-accent)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>
        {[28, 88, 148, 208, 268].map((y) => (
          <line
            key={y}
            x1="58"
            x2="742"
            y1={y}
            y2={y}
            className="stroke-border"
            strokeDasharray="3 4"
          />
        ))}
        <g className="fill-text-muted text-[11px] font-medium">
          {["100", "75", "50", "25", "0"].map((value, index) => (
            <text key={value} x="46" y={32 + index * 60} textAnchor="end">
              {value}
            </text>
          ))}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
            (value, index) => (
              <text
                key={value}
                x={60 + index * 113}
                y="294"
                textAnchor="middle"
              >
                {value}
              </text>
            ),
          )}
        </g>
        <path
          d="M60 248 C100 210 130 166 173 164 C215 162 245 204 286 198 C327 192 358 126 399 105 C440 84 471 55 512 62 C553 69 584 144 625 176 C666 208 705 235 738 252 L738 268 L60 268 Z"
          fill="url(#jobs-area)"
        />
        <path
          d="M60 248 C100 210 130 166 173 164 C215 162 245 204 286 198 C327 192 358 126 399 105 C440 84 471 55 512 62 C553 69 584 144 625 176 C666 208 705 235 738 252"
          fill="none"
          className="stroke-accent"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </ChartFrame>
  );
}

function MatchDistributionChart(): React.ReactNode {
  const bars = [5, 15, 45, 85, 35];
  const labels = ["50-60%", "60-70%", "70-80%", "80-90%", "90-100%"];

  return (
    <ChartFrame title="Match Score Distribution">
      <div
        role="img"
        aria-label="Match score distribution: 5 percent from 50 to 60, 15 percent from 60 to 70, 45 percent from 70 to 80, 85 percent from 80 to 90, and 35 percent from 90 to 100."
        className="grid min-h-[280px] grid-cols-[28px_1fr] gap-3"
      >
        <div className="flex flex-col justify-between pb-11 text-right text-[11px] font-medium text-text-muted">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>
        <div className="relative grid grid-cols-5 gap-2 border-b border-border pb-11">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[calc(100%-44px)] flex-col justify-between">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                aria-hidden="true"
                className="block border-t border-dashed border-border"
              />
            ))}
          </div>
          {bars.map((value, index) => (
            <div
              key={labels[index]}
              className="relative flex items-end justify-center"
            >
              <span
                aria-hidden="true"
                className="w-full max-w-10 rounded-t-md bg-success"
                style={{ height: `${value}%` }}
              />
              <span className="absolute -bottom-9 text-center text-[10px] font-medium leading-4 text-text-muted">
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
}

export function DashboardOverview(): React.ReactNode {
  return (
    <div className="space-y-6">
      <section
        aria-label="Dashboard statistics"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total Jobs Found"
          value="284"
          trend="+12%"
          helper="vs last week"
        />
        <StatCard
          label="Avg. Match Rate"
          value="82%"
          trend="+3%"
          helper="vs last week"
        />
        <StatCard
          label="Companies Researched"
          value="35"
          helper="Total researched"
        />
        <StatCard label="Jobs This Week" value="28" helper="New this week" />
      </section>

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <RecentActivity />
        <CompanyResearchChart />
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-[2fr_1fr]">
        <JobsFoundChart />
        <MatchDistributionChart />
      </div>
    </div>
  );
}
