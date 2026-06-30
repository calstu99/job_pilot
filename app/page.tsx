import Image from "next/image";
import Link from "next/link";

const primaryFeatures = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-20">
        <Link href="/" aria-label="JobPilot home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={166}
            height={56}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-12 text-[18px] font-normal leading-7 text-text-darker md:flex"
        >
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/find-jobs">Find Jobs</Link>
          <Link href="/profile">Profile</Link>
        </nav>

        <Link
          href="/login"
          className="rounded-md border border-border-muted bg-overlay-dark px-4 py-3 text-[15px] font-semibold leading-5 text-accent-foreground shadow-sm transition hover:bg-overlay sm:px-6 sm:text-[18px] sm:leading-6"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}

function CtaButtons() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Link
        href="/login"
        className="rounded-md border border-border-muted bg-overlay-dark px-8 py-4 text-[22px] font-semibold leading-7 text-accent-foreground shadow-sm transition hover:bg-overlay"
      >
        Get Started <span className="ml-2 text-text-muted">▶</span>
      </Link>
      <Link
        href="/find-jobs"
        className="rounded-md border border-border bg-surface/80 px-8 py-4 text-[22px] font-medium leading-7 text-text-slate shadow-sm transition hover:bg-surface-secondary"
      >
        Find Your First Match
      </Link>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-wash border-b border-border px-6 pb-20 pt-24 text-center sm:px-10 lg:px-20 lg:pb-24 lg:pt-28">
      <h1 className="mx-auto max-w-[980px] text-[40px] font-bold leading-[1.08] text-text-slate sm:text-[70px] lg:text-[82px]">
        <span className="block">Job hunting is hard.</span>
        <span className="block">Your tools shouldn&apos;t be.</span>
      </h1>
      <p className="mx-auto mt-8 max-w-[760px] text-[22px] font-normal leading-9 text-text-slate-medium">
        Stop applying blind. JobPilot finds the jobs, researches the companies,
        and gives you everything you need to stand out.
      </p>
      <div className="mt-10">
        <CtaButtons />
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="overflow-hidden border-b border-border bg-surface-tertiary px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-[1260px]">
        <Image
          src="/images/dashboard-demo.png"
          alt="JobPilot dashboard showing job stats, recent activity, and research charts"
          width={4788}
          height={2416}
          priority
          className="w-full rounded-[28px] shadow-[0_24px_70px_color-mix(in_srgb,var(--color-info-muted)_26%,transparent)]"
        />
      </div>
    </section>
  );
}

function JobManagementSection() {
  return (
    <section className="grid border-b border-border bg-surface lg:grid-cols-2">
      <div className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border px-8 py-16 sm:px-16 lg:px-20 lg:py-20">
          <h2 className="max-w-[560px] text-[38px] font-bold leading-[1.12] text-text-slate sm:text-[58px]">
            Manage Your Job Search With Ease
          </h2>
        </div>
        <div className="divide-y divide-border">
          {primaryFeatures.map((feature, index) => (
            <article
              key={feature.title}
              className={`px-8 py-10 sm:px-16 lg:px-20 ${
                index === 0 ? "border-l-2 border-l-accent" : ""
              }`}
            >
              <h3 className="text-[22px] font-bold leading-8 text-text-slate sm:text-[24px]">
                {feature.title}
              </h3>
              <p className="mt-4 max-w-[640px] text-[20px] font-normal leading-8 text-text-slate-medium sm:text-[23px] sm:leading-9">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="flex items-center bg-surface-muted px-6 py-16 sm:px-12 lg:px-16">
        <Image
          src="/images/jobs-lists.png"
          alt="JobPilot job list with company rows, match scores, salaries, and sources"
          width={2364}
          height={1778}
          className="w-full rounded-xl shadow-[0_12px_28px_color-mix(in_srgb,var(--color-text-muted)_25%,transparent)]"
        />
      </div>
    </section>
  );
}

function ConfidenceSection() {
  return (
    <section className="grid border-b border-border bg-surface lg:grid-cols-2">
      <div className="flex items-center bg-surface-muted px-8 py-16 sm:px-16 lg:px-20">
        <Image
          src="/images/agnet-log.png"
          alt="Agent log showing JobPilot finding matching roles and preparing application materials"
          width={2144}
          height={1656}
          className="w-full rounded-xl shadow-[0_14px_34px_color-mix(in_srgb,var(--color-text-muted)_24%,transparent)]"
        />
      </div>

      <div className="border-t border-border lg:border-l lg:border-t-0">
        <div className="border-b border-border px-8 py-16 sm:px-16 lg:px-20 lg:py-20">
          <h2 className="max-w-[680px] text-[38px] font-bold leading-[1.12] text-text-slate sm:text-[58px]">
            Apply With More Confidence, Every Time
          </h2>
        </div>
        <div className="divide-y divide-border">
          {confidenceFeatures.map((feature) => (
            <article
              key={feature.title}
              className={`px-8 py-10 sm:px-16 lg:px-20 ${
                feature.active ? "border-l-2 border-l-success-dark" : ""
              }`}
            >
              <h3 className="text-[22px] font-bold leading-8 text-text-slate sm:text-[24px]">
                {feature.title}
              </h3>
              <p className="mt-4 max-w-[720px] text-[20px] font-normal leading-8 text-text-slate-medium sm:text-[23px] sm:leading-9">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="border-b border-border bg-surface px-6 py-24 text-center sm:px-10 lg:px-20">
      <p className="text-[18px] font-medium leading-7 text-accent">
        SUCCESS STORIES
      </p>
      <blockquote className="mx-auto mt-8 max-w-[960px] text-[34px] font-semibold leading-[1.38] text-text-darker sm:text-[42px]">
        &quot;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3
        offers on the table simultaneously.&quot;
      </blockquote>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={64}
          height={64}
          className="rounded-md"
        />
        <div className="text-left">
          <p className="text-[21px] font-bold leading-7 text-text-black">
            Tom Wilson
          </p>
          <p className="text-[18px] font-normal leading-7 text-text-secondary">
            Junior Developer
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="hero-wash border-b border-border px-6 py-24 text-center sm:px-10 lg:px-20">
      <h2 className="mx-auto max-w-[860px] text-[40px] font-bold leading-[1.1] text-text-slate sm:text-[68px]">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p className="mx-auto mt-8 max-w-[760px] text-[22px] font-normal leading-8 text-text-slate-medium">
        Set up your profile, upload your resume, and start finding matches in
        minutes.
      </p>
      <div className="mt-10">
        <CtaButtons />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface px-6 py-12 sm:px-10 lg:px-20">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" aria-label="JobPilot home">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={166}
            height={56}
            className="h-12 w-auto"
          />
        </Link>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-8 text-[20px] font-normal leading-8 text-text-darker sm:gap-12"
        >
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Condition</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <Header />
      <div className="mx-auto max-w-[1440px] border-x border-border bg-surface">
        <HeroSection />
        <DashboardPreview />
        <div className="hatched-divider" aria-hidden="true" />
        <JobManagementSection />
        <div className="hatched-divider" aria-hidden="true" />
        <ConfidenceSection />
        <div className="hatched-divider" aria-hidden="true" />
        <TestimonialSection />
        <div className="hatched-divider" aria-hidden="true" />
        <FinalCtaSection />
        <div className="hatched-divider" aria-hidden="true" />
        <Footer />
      </div>
    </main>
  );
}
