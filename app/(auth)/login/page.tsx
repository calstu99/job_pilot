import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  initiateGitHubOAuth,
  initiateGoogleOAuth,
} from "@/actions/auth";
import { getCurrentUser } from "@/lib/insforge-server";

const errorMessages: Record<string, string> = {
  oauth_failed: "We could not complete sign in. Please try again.",
  missing_verifier: "Your sign in session expired. Please try again.",
  exchange_failed: "We could not verify your sign in. Please try again.",
  oauth_start_failed: "We could not start sign in. Please try again.",
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.ReactNode> {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const message = params.error ? errorMessages[params.error] : null;

  return (
    <main className="min-h-screen bg-background px-6 py-8 sm:px-10 lg:px-20">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1440px] flex-col">
        <header className="flex h-16 items-center justify-between">
          <Link href="/" aria-label="JobPilot home">
            <Image
              src="/logo.png"
              alt="JobPilot"
              width={166}
              height={56}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border bg-surface px-4 py-2 text-[14px] font-medium leading-5 text-text-primary transition hover:bg-surface-secondary"
          >
            Back home
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[440px] rounded-xl border border-border bg-surface p-6 shadow-sm">
            <div>
              <p className="text-[12px] font-medium uppercase leading-4 text-accent">
                Welcome to JobPilot
              </p>
              <h1 className="mt-3 text-[30px] font-semibold leading-9 text-text-primary">
                Sign in to continue
              </h1>
              <p className="mt-3 text-[14px] font-medium leading-5 text-text-secondary">
                Use your Google or GitHub account to manage your profile, job
                matches, and company research.
              </p>
            </div>

            {message ? (
              <p className="mt-6 rounded-md border border-border bg-surface-secondary px-3 py-2 text-[14px] font-medium leading-5 text-error">
                {message}
              </p>
            ) : null}

            <div className="mt-8 grid gap-3">
              <form action={initiateGoogleOAuth}>
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 text-[14px] font-medium leading-5 text-text-primary transition hover:bg-surface-secondary"
                >
                  <span className="flex size-6 items-center justify-center rounded-full border border-border text-[13px] font-semibold leading-4 text-text-dark">
                    G
                  </span>
                  Continue with Google
                </button>
              </form>

              <form action={initiateGitHubOAuth}>
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-overlay-dark px-4 text-[14px] font-medium leading-5 text-accent-foreground transition hover:bg-overlay"
                >
                  <span className="flex size-6 items-center justify-center rounded-full border border-border-muted text-[13px] font-semibold leading-4 text-accent-foreground">
                    GH
                  </span>
                  Continue with GitHub
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
