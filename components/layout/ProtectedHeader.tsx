import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/actions/auth";

type ProtectedHeaderProps = {
  activePage: "dashboard" | "find-jobs" | "profile";
};

const navItems = [
  {
    href: "/dashboard",
    id: "dashboard",
    label: "Dashboard",
  },
  {
    href: "/find-jobs",
    id: "find-jobs",
    label: "Find Jobs",
  },
  {
    href: "/profile",
    id: "profile",
    label: "Profile",
  },
] satisfies Array<{
  href: string;
  id: ProtectedHeaderProps["activePage"];
  label: string;
}>;

export function ProtectedHeader({
  activePage,
}: ProtectedHeaderProps): React.ReactNode {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link href="/" aria-label="JobPilot home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={166}
            height={56}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <nav
            aria-label="Primary navigation"
            className="flex flex-wrap items-center gap-6 text-[14px] font-medium leading-5"
          >
            {navItems.map((item) => {
              const isActive = item.id === activePage;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "text-accent" : "text-text-dark"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-border bg-surface px-4 py-2 text-[14px] font-medium leading-5 text-text-primary shadow-sm transition hover:bg-surface-secondary"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
