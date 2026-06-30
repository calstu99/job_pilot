import { PostHog } from "posthog-node";

export type PostHogEvent =
  | {
      name: "job_search_started";
      properties: {
        jobTitle: string;
        location: string;
        userId: string;
      };
    }
  | {
      name: "job_found";
      properties: {
        matchScore: number;
        source: "search" | "url";
        userId: string;
      };
    }
  | {
      name: "profile_completed";
      properties: {
        userId: string;
      };
    }
  | {
      name: "company_researched";
      properties: {
        company: string;
        jobId: string;
        userId: string;
      };
    };

function getPostHogKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  );
}

export function createPostHogServer(): PostHog | null {
  const postHogKey = getPostHogKey();
  const postHogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!postHogKey || !postHogHost) {
    return null;
  }

  return new PostHog(postHogKey, {
    host: postHogHost,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogEvent(
  event: PostHogEvent,
): Promise<void> {
  const posthog = createPostHogServer();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId: event.properties.userId,
      event: event.name,
      properties: event.properties,
    });
  } catch (error) {
    console.error("[lib/posthog-server] capturePostHogEvent", error);
  } finally {
    try {
      await posthog.shutdown();
    } catch (error) {
      console.error("[lib/posthog-server] shutdown", error);
    }
  }
}
