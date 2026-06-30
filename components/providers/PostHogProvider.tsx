"use client";

import { useEffect, type ReactNode } from "react";
import { PostHogProvider as ReactPostHogProvider } from "posthog-js/react";

import {
  identifyPostHogUser,
  initPostHog,
  posthog,
  resetPostHog,
} from "@/lib/posthog-client";

type PostHogProviderProps = {
  children: ReactNode;
  userEmail: string | null;
  userId: string | null;
};

const IDENTIFIED_USER_STORAGE_KEY = "jobpilot_posthog_identified_user";

function getStoredIdentifiedUser(): string | null {
  try {
    return window.localStorage.getItem(IDENTIFIED_USER_STORAGE_KEY);
  } catch (error) {
    console.error("[PostHogProvider] getStoredIdentifiedUser", error);
    return null;
  }
}

function setStoredIdentifiedUser(userId: string): void {
  try {
    window.localStorage.setItem(IDENTIFIED_USER_STORAGE_KEY, userId);
  } catch (error) {
    console.error("[PostHogProvider] setStoredIdentifiedUser", error);
  }
}

function clearStoredIdentifiedUser(): void {
  try {
    window.localStorage.removeItem(IDENTIFIED_USER_STORAGE_KEY);
  } catch (error) {
    console.error("[PostHogProvider] clearStoredIdentifiedUser", error);
  }
}

export function PostHogProvider({
  children,
  userEmail,
  userId,
}: PostHogProviderProps): ReactNode {
  useEffect(() => {
    initPostHog();

    if (userId) {
      identifyPostHogUser(userId, userEmail);
      setStoredIdentifiedUser(userId);
      return;
    }

    if (getStoredIdentifiedUser()) {
      resetPostHog();
      clearStoredIdentifiedUser();
    }
  }, [userEmail, userId]);

  return (
    <ReactPostHogProvider client={posthog}>{children}</ReactPostHogProvider>
  );
}
