import { requireUser } from "@/lib/insforge-server";

type JobDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps): Promise<React.ReactNode> {
  const user = await requireUser();
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background px-6 py-8 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-[1440px] rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[12px] font-medium uppercase leading-4 text-accent">
          Job Details
        </p>
        <h1 className="mt-3 text-[30px] font-semibold leading-9 text-text-primary">
          Job {id}
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-5 text-text-secondary">
          You are signed in as {user.email}. The job details experience is
          scheduled for Phase 4.
        </p>
      </section>
    </main>
  );
}
