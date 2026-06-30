import { requireUser } from "@/lib/insforge-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage(): Promise<React.ReactNode> {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-background px-6 py-8 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-[1440px] rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[12px] font-medium uppercase leading-4 text-accent">
          Dashboard
        </p>
        <h1 className="mt-3 text-[30px] font-semibold leading-9 text-text-primary">
          Welcome back
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-5 text-text-secondary">
          You are signed in as {user.email}. The full dashboard UI is scheduled
          for Phase 5.
        </p>
      </section>
    </main>
  );
}
