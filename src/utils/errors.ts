import { logger } from "./logger.js";

export class SpecNotFoundError extends Error {
  constructor(spec: string) {
    super(`Spec file not found: ${spec}`);
    this.name = "SpecNotFoundError";
  }
}

export class SpecOutsideProjectError extends Error {
  constructor(spec: string) {
    super(`Spec path resolves outside the project directory: ${spec}`);
    this.name = "SpecOutsideProjectError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(path: string) {
    super(`Project path does not exist: ${path}`);
    this.name = "ProjectNotFoundError";
  }
}

export class DevServerNotRunningError extends Error {
  constructor(baseUrl: string) {
    super(`Dev server not reachable at ${baseUrl}. Start it with "npm run dev" before running tests.`);
    this.name = "DevServerNotRunningError";
  }
}

export class CypressRunError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CypressRunError";
  }
}

export function handleToolError(err: unknown, action: string) {
  const isUserError =
    err instanceof SpecNotFoundError ||
    err instanceof SpecOutsideProjectError ||
    err instanceof ProjectNotFoundError ||
    err instanceof DevServerNotRunningError;

  const message = err instanceof Error ? err.message : String(err);

  if (!isUserError) {
    logger.error(`Tool error during ${action}`, { error: message });
  }

  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}
