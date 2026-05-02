type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  return JSON.stringify({ timestamp, level, message, ...(data !== undefined ? { data } : {}) });
}

// All output goes to stderr — stdout is the JSON-RPC protocol channel in stdio transport
export const logger = {
  debug(message: string, data?: unknown) {
    if (shouldLog("debug")) process.stderr.write(formatMessage("debug", message, data) + "\n");
  },
  info(message: string, data?: unknown) {
    if (shouldLog("info")) process.stderr.write(formatMessage("info", message, data) + "\n");
  },
  warn(message: string, data?: unknown) {
    if (shouldLog("warn")) process.stderr.write(formatMessage("warn", message, data) + "\n");
  },
  error(message: string, data?: unknown) {
    if (shouldLog("error")) process.stderr.write(formatMessage("error", message, data) + "\n");
  },
};
