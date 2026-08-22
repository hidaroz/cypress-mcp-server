import { resolve, sep } from "node:path";
import { SpecOutsideProjectError } from "./errors.js";

/**
 * Resolve a client-supplied spec path or glob against the project root, and
 * refuse anything that lands outside it.
 *
 * `resolve()` on its own is not a containment check. An absolute `input`
 * discards `projectPath` entirely, and enough `../` segments walk out of it.
 * Whatever this returns is handed to Cypress and executed, so an escape is
 * arbitrary code execution chosen by whoever is steering the MCP client --
 * which, for an agent, means anything that can get text into its context.
 */
export function resolveWithinProject(projectPath: string, input: string): string {
  const root = resolve(projectPath);
  const target = resolve(root, input);

  if (target !== root && !target.startsWith(root + sep)) {
    throw new SpecOutsideProjectError(input);
  }

  return target;
}
