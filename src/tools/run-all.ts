import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCypress } from "../cypress/runner.js";
import { saveResults } from "../cypress/results-store.js";
import { handleToolError } from "../utils/errors.js";
import { formatSummary } from "./format.js";

export function registerRunAll(server: McpServer, projectPath: string): void {
  server.registerTool(
    "run_all",
    {
      description:
        "Run all Cypress specs (or a filtered subset). The dev server must be running at baseUrl (default localhost:8080) before calling this tool.",
      inputSchema: {
        specPattern: z
          .string()
          .optional()
          .describe("Glob pattern to filter specs (e.g. cypress/e2e/auth*)"),
        browser: z.string().optional().default("chrome").describe("Browser to run tests in"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
      },
    },
    async ({ specPattern, browser }) => {
      try {
        const summary = await runCypress({
          projectPath,
          spec: specPattern,
          browser,
        });
        saveResults(projectPath, summary);

        return {
          content: [{ type: "text", text: formatSummary(summary) }],
        };
      } catch (err: unknown) {
        return handleToolError(err, "run_all");
      }
    }
  );
}
