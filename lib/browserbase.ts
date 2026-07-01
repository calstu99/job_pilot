import "server-only";

import { Browserbase } from "@browserbasehq/sdk";

export async function createResearchBrowserSession(): Promise<string> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error("Browserbase credentials are not configured.");
  }

  const browserbase = new Browserbase({ apiKey });
  const session = await browserbase.sessions.create({
    projectId,
    timeout: 120,
  });

  return session.id;
}
