import { z } from "zod";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCypress } from "../cypress/runner.js";
import { saveResults } from "../cypress/results-store.js";
import { SpecNotFoundError, handleToolError } from "../utils/errors.js";
import { formatSummary } from "./format.js";

export function registerRunSpec(server: McpServer, projectPath: string): void {
  server.registerTool(
    "run_spec",
    {
      description:
        "Run a single Cypress spec file and return results. The dev server must be running at baseUrl (default localhost:8080) before calling this tool.",
      inputSchema: {
        spec: z.string().describe("Relative path to the spec file (e.g. cypress/e2e/auth.cy.ts)"),
        browser: z.string().optional().default("chrome").describe("Browser to run tests in"),
        headed: z.coerce.boolean().optional().default(false).describe("Run in headed mode (visible browser window)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
      },
    },
    async ({ spec, browser, headed }) => {
      try {
        const specPath = resolve(projectPath, spec);
        if (!existsSync(specPath)) {
          throw new SpecNotFoundError(spec);
        }

        const summary = await runCypress({ projectPath, spec: specPath, browser, headed });
        saveResults(projectPath, summary);

        return {
          content: [{ type: "text", text: formatSummary(summary) }],
        };
      } catch (err: unknown) {
        return handleToolError(err, "run_spec");
      }
    }
  );
}
