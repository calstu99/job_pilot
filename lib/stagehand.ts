import "server-only";

import { Stagehand } from "@browserbasehq/stagehand";

export function createResearchStagehand(sessionId: string): Stagehand {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !projectId || !openAiApiKey) {
    throw new Error("Company research credentials are not configured.");
  }

  return new Stagehand({
    apiKey,
    browserbaseSessionID: sessionId,
    disablePino: true,
    env: "BROWSERBASE",
    model: {
      apiKey: openAiApiKey,
      modelName: "gpt-4o",
    },
    projectId,
    verbose: 0,
  });
}
