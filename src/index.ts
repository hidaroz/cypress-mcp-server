import { existsSync } from "node:fs";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";
import { logger } from "./utils/logger.js";

const projectPath = process.env.CYPRESS_PROJECT_PATH;

if (!projectPath) {
  logger.error("CYPRESS_PROJECT_PATH environment variable is required");
  process.exit(1);
}

if (!existsSync(projectPath)) {
  logger.error(`Project path does not exist: ${projectPath}`);
  process.exit(1);
}

const server = createMcpServer(projectPath);
const transport = new StdioServerTransport();
await server.connect(transport);

logger.info(`Cypress MCP server started for project: ${projectPath}`);
