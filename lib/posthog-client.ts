import posthog from "posthog-js";

let initialized = false;

function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  );
}

export function initPostHog(): void {
  if (initialized || typeof window === "undefined") {
    return;
  }

  const postHogKey = getPostHogKey();
  const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!postHogKey || !postHogHost) {
    return;
  }

  posthog.init(postHogKey, {
    api_host: postHogHost,
    autocapture: false,
    capture_pageleave: false,
    capture_pageview: false,
  });
  initialized = true;
}

export function identifyPostHogUser(userId: string, email?: string | null): void {
  initPostHog();
  posthog.identify(userId, email ? { email } : undefined);
}

export function resetPostHog(): void {
  initPostHog();
  posthog.reset();
}

export { posthog };
