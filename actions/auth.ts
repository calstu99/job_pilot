"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

type OAuthProvider = "google" | "github";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function initiateOAuth(provider: OAuthProvider): Promise<void> {
  const cookieStore = await cookies();
  let oauthUrl: string | null = null;

  try {
    const auth = createAuthActions({ cookies: cookieStore });
    const { data, error } = await auth.signInWithOAuth(provider, {
      redirectTo: new URL("/api/auth/callback", getAppUrl()).toString(),
      skipBrowserRedirect: true,
    });

    if (error || !data.url || !data.codeVerifier) {
      console.error("[actions/auth] initiateOAuth", error);
    } else {
      cookieStore.set("insforge_code_verifier", data.codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
      oauthUrl = data.url;
    }
  } catch (error) {
    console.error("[actions/auth] initiateOAuth", error);
  }

  if (!oauthUrl) {
    redirect("/login?error=oauth_start_failed");
  }

  redirect(oauthUrl);
}

export async function initiateGoogleOAuth(): Promise<void> {
  await initiateOAuth("google");
}

export async function initiateGitHubOAuth(): Promise<void> {
  await initiateOAuth("github");
}
