import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadResults } from "../cypress/results-store.js";
import { handleToolError } from "../utils/errors.js";
import { formatSummary } from "./format.js";

export function registerGetLastResults(server: McpServer, projectPath: string): void {
  server.registerTool(
    "get_last_results",
    {
      description: "Get results from the most recent Cypress test run.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
    },
    async () => {
      try {
        const results = loadResults(projectPath);
        if (!results) {
          return {
            content: [{ type: "text", text: "No previous test results found. Run a spec first." }],
          };
        }

        const header = `Last run: ${results.timestamp}\n\n`;
        return {
          content: [{ type: "text", text: header + formatSummary(results) }],
        };
      } catch (err: unknown) {
        return handleToolError(err, "get_last_results");
      }
    }
  );
}
