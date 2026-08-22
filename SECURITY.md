# Security

## Reporting a vulnerability

Report privately via [GitHub Security Advisories](https://github.com/hidaroz/cypress-mcp-server/security/advisories/new).
Please don't open a public issue for anything exploitable.

Expect an acknowledgement within a week. This is a personal project, not a funded
one — there's no bounty, and no guaranteed patch window.

## What this server lets a model do

It runs Cypress. That is the whole point, and it is also the threat model: a
model that can call `run_spec` can execute a JavaScript file on your machine,
with your user's privileges, and Cypress will happily drive a real browser while
doing it. There is no sandbox here. Treat this server the way you'd treat
handing an agent your shell.

**The project root is fixed at startup, not chosen per call.** `CYPRESS_PROJECT_PATH`
is read once in `src/index.ts` and passed down to every tool. A tool call cannot
point the server at a different project.

**Spec paths from the client are contained to that root.** `run_spec` takes a
`spec` and `run_all` takes a `specPattern`, both client-supplied strings, and
both go through `resolveWithinProject()` in `src/utils/paths.ts` before they
reach Cypress. `resolve()` alone is not a containment check — an absolute path
discards the root entirely and enough `../` segments walk out of it — so the
helper compares against `root + sep` and throws `SpecOutsideProjectError`
otherwise. The `+ sep` matters: without it, a sibling directory whose name
merely starts with the root's name would pass.

This was a real hole, not a hypothetical one. Before that helper existed, both
tools called `resolve(projectPath, input)` and used the result directly, so a
`spec` of `/tmp/evil.cy.ts` executed `/tmp/evil.cy.ts`. For an agent, "client
supplied" includes anything that can get text into its context — a web page it
reads, a file it opens, an issue comment. Prompt injection was arbitrary code
execution.

## Known gaps

**`getBaseUrl()` fails quietly.** `src/cypress/runner.ts` finds the base URL by
regex-matching `cypress.config.ts` as text, and falls back to
`http://localhost:8080` on any failure — a missing config, a renamed file, a
`baseUrl` built from a variable instead of a literal. You can therefore run a
suite against a different origin than you think you're testing, and nothing
warns you. Check the reported base URL in the run summary.

**No authentication and no rate limiting.** Anything that can reach the server's
stdio transport can run tests. That's acceptable for a locally-spawned MCP
server and not acceptable for anything else. Don't expose it over a network.

**Results are written inside the project.** `saveResults()` writes
`cypress/.last-run.json` under the project root, and screenshots and videos land
in `cypress/screenshots` and `cypress/videos`. Failed-test screenshots can
capture whatever was on the page, including credentials typed by a test fixture.
Gitignore those directories.

**Cypress runs are not resource-bounded.** There's no timeout on
`runCypress()` beyond Cypress's own defaults, so a hung suite hangs the tool call.
