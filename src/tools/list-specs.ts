import { z } from "zod";
import { readdirSync, statSync } from "node:fs";
import { resolve, relative } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolError } from "../utils/errors.js";

function findSpecs(dir: string, base: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSpecs(full, base));
    } else if (entry.name.endsWith(".cy.ts") || entry.name.endsWith(".cy.js")) {
      results.push(relative(base, full));
    }
  }
  return results;
}

export function registerListSpecs(server: McpServer, projectPath: string): void {
  server.registerTool(
    "list_specs",
    {
      description: "List all Cypress e2e spec files in the project.",
      inputSchema: {
        folder: z
          .string()
          .optional()
          .default("cypress/e2e")
          .describe("Subfolder to search for specs (default: cypress/e2e)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
    },
    async ({ folder }) => {
      try {
        const dir = resolve(projectPath, folder);
        const specs = findSpecs(dir, projectPath);

        if (specs.length === 0) {
          return {
            content: [{ type: "text", text: `No spec files found in ${folder}.` }],
          };
        }

        const lines = specs.map((s) => `- ${s}`).join("\n");
        return {
          content: [{ type: "text", text: `## Spec Files (${specs.length})\n\n${lines}` }],
        };
      } catch (err: unknown) {
        return handleToolError(err, "list_specs");
      }
    }
  );
}
