import cypress from "cypress";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DevServerNotRunningError, CypressRunError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export interface TestResult {
  title: string[];
  state: "passed" | "failed" | "pending";
  duration: number;
  error?: string;
  screenshot?: string;
}

export interface SpecResult {
  name: string;
  path: string;
  passed: number;
  failed: number;
  pending: number;
  tests: TestResult[];
}

export interface RunSummary {
  status: "passed" | "failed" | "errored";
  totalTests: number;
  passed: number;
  failed: number;
  pending: number;
  duration: number;
  specs: SpecResult[];
  screenshots: string[];
  videos: string[];
}

function getBaseUrl(projectPath: string): string {
  try {
    const configPath = resolve(projectPath, "cypress.config.ts");
    const content = readFileSync(configPath, "utf-8");
    const match = content.match(/baseUrl:\s*["']([^"']+)["']/);
    return match?.[1] ?? "http://localhost:8080";
  } catch {
    return "http://localhost:8080";
  }
}

async function checkDevServer(baseUrl: string): Promise<void> {
  try {
    const response = await fetch(baseUrl, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    if (!response.ok && response.status !== 304) {
      throw new DevServerNotRunningError(baseUrl);
    }
  } catch (err) {
    if (err instanceof DevServerNotRunningError) throw err;
    throw new DevServerNotRunningError(baseUrl);
  }
}

export async function runCypress(options: {
  projectPath: string;
  spec?: string;
  browser?: string;
  headed?: boolean;
}): Promise<RunSummary> {
  const { projectPath, spec, browser = "chrome", headed = false } = options;
  const baseUrl = getBaseUrl(projectPath);

  await checkDevServer(baseUrl);

  logger.info("Starting Cypress run", { projectPath, spec, browser, headed });

  const result = await cypress.run({
    project: projectPath,
    spec,
    browser,
    headed,
    config: { video: true },
    quiet: true,
  });

  if ("failures" in result && typeof result.failures === "number" && result.message) {
    throw new CypressRunError(result.message);
  }

  const runResult = result as CypressCommandLine.CypressRunResult;
  return parseRunResult(runResult);
}

function parseRunResult(result: CypressCommandLine.CypressRunResult): RunSummary {
  const specs: SpecResult[] = result.runs.map((run) => {
    const tests: TestResult[] = run.tests.map((test) => ({
      title: test.title,
      state: test.state as "passed" | "failed" | "pending",
      duration: test.duration ?? 0,
      error: test.displayError ?? undefined,
    }));

    return {
      name: run.spec.name,
      path: run.spec.absolute,
      passed: run.stats.passes,
      failed: run.stats.failures,
      pending: run.stats.pending,
      tests,
    };
  });

  const allScreenshots = result.runs.flatMap((run) =>
    run.screenshots.map((s) => s.path)
  );

  const allVideos = result.runs
    .map((run) => run.video)
    .filter((v): v is string => v !== null);

  return {
    status: result.totalFailed > 0 ? "failed" : "passed",
    totalTests: result.totalTests,
    passed: result.totalPassed,
    failed: result.totalFailed,
    pending: result.totalPending,
    duration: result.totalDuration,
    specs,
    screenshots: allScreenshots,
    videos: allVideos,
  };
}
