import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { getCurrentUser } from "@/lib/insforge-server";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPilot",
  description:
    "AI-powered job hunting assistant for finding, matching, and researching better roles.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactNode> {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PostHogProvider
          userEmail={user?.email ?? null}
          userId={user?.id ?? null}
        >
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
