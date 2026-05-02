import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { RunSummary } from "./runner.js";
import { logger } from "../utils/logger.js";

function getStorePath(projectPath: string): string {
  return resolve(projectPath, "cypress", ".last-run.json");
}

export function saveResults(projectPath: string, summary: RunSummary): void {
  const storePath = getStorePath(projectPath);
  const payload = { ...summary, timestamp: new Date().toISOString() };
  try {
    mkdirSync(dirname(storePath), { recursive: true });
    writeFileSync(storePath, JSON.stringify(payload, null, 2));
    logger.info("Results saved", { path: storePath });
  } catch (err) {
    logger.error("Failed to save results", { error: String(err) });
  }
}

export function loadResults(projectPath: string): (RunSummary & { timestamp: string }) | null {
  const storePath = getStorePath(projectPath);
  try {
    const data = readFileSync(storePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}
