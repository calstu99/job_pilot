import { requireUser } from "@/lib/insforge-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage(): Promise<React.ReactNode> {
  const user = await requireUser();

  return (
    <main className="min-h-screen bg-background px-6 py-8 sm:px-10 lg:px-20">
      <section className="mx-auto max-w-[1440px] rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-[12px] font-medium uppercase leading-4 text-accent">
          Profile
        </p>
        <h1 className="mt-3 text-[30px] font-semibold leading-9 text-text-primary">
          Profile setup
        </h1>
        <p className="mt-3 text-[14px] font-medium leading-5 text-text-secondary">
          You are signed in as {user.email}. The profile form is scheduled for
          Phase 2.
        </p>
      </section>
    </main>
  );
}
