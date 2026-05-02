import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerListSpecs } from "./tools/list-specs.js";
import { registerRunSpec } from "./tools/run-spec.js";
import { registerRunAll } from "./tools/run-all.js";
import { registerGetLastResults } from "./tools/get-last-results.js";
import { registerGetScreenshot } from "./tools/get-screenshot.js";
import { registerGetVideo } from "./tools/get-video.js";

export function createMcpServer(projectPath: string): McpServer {
  const server = new McpServer({
    name: "cypress-mcp-server",
    version: "1.0.0",
  });

  registerListSpecs(server, projectPath);
  registerRunSpec(server, projectPath);
  registerRunAll(server, projectPath);
  registerGetLastResults(server, projectPath);
  registerGetScreenshot(server, projectPath);
  registerGetVideo(server, projectPath);

  return server;
}
