import { z } from "zod";
import { readdirSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolError } from "../utils/errors.js";

function findScreenshots(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findScreenshots(full));
    } else if (entry.name.endsWith(".png")) {
      results.push(full);
    }
  }
  return results;
}

export function registerGetScreenshot(server: McpServer, projectPath: string): void {
  server.registerTool(
    "get_screenshot",
    {
      description:
        "Find Cypress failure screenshots. Returns absolute file paths that can be viewed with the Read tool.",
      inputSchema: {
        spec: z
          .string()
          .optional()
          .describe("Filter screenshots by spec name (substring match)"),
        testTitle: z
          .string()
          .optional()
          .describe("Filter screenshots by test title (substring match)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
    },
    async ({ spec, testTitle }) => {
      try {
        const screenshotsDir = resolve(projectPath, "cypress", "screenshots");
        let screenshots = findScreenshots(screenshotsDir);

        if (spec) {
          screenshots = screenshots.filter((s) => s.includes(spec));
        }
        if (testTitle) {
          screenshots = screenshots.filter((s) => s.includes(testTitle));
        }

        if (screenshots.length === 0) {
          return {
            content: [{ type: "text", text: "No screenshots found matching the criteria." }],
          };
        }

        const lines = screenshots
          .map((s) => `- ${s}`)
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `## Screenshots (${screenshots.length})\n\n${lines}\n\nUse the Read tool to view these image files.`,
            },
          ],
        };
      } catch (err: unknown) {
        return handleToolError(err, "get_screenshot");
      }
    }
  );
}
