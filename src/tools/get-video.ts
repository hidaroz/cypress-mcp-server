import { z } from "zod";
import { readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolError } from "../utils/errors.js";

export function registerGetVideo(server: McpServer, projectPath: string): void {
  server.registerTool(
    "get_video",
    {
      description: "Find Cypress test video recordings. Returns absolute file paths.",
      inputSchema: {
        spec: z
          .string()
          .optional()
          .describe("Filter videos by spec name (substring match)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
      },
    },
    async ({ spec }) => {
      try {
        const videosDir = resolve(projectPath, "cypress", "videos");
        if (!existsSync(videosDir)) {
          return {
            content: [{ type: "text", text: "No videos directory found. Run tests with video: true first." }],
          };
        }

        let videos = readdirSync(videosDir)
          .filter((f) => f.endsWith(".mp4"))
          .map((f) => resolve(videosDir, f));

        if (spec) {
          videos = videos.filter((v) => v.includes(spec));
        }

        if (videos.length === 0) {
          return {
            content: [{ type: "text", text: "No video recordings found matching the criteria." }],
          };
        }

        const lines = videos.map((v) => `- ${v}`).join("\n");
        return {
          content: [{ type: "text", text: `## Videos (${videos.length})\n\n${lines}` }],
        };
      } catch (err: unknown) {
        return handleToolError(err, "get_video");
      }
    }
  );
}
