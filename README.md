# cypress-mcp-server

An MCP (Model Context Protocol) server that gives Claude the ability to run Cypress end-to-end tests, retrieve results, and inspect test artifacts — all from natural language.

## Features

- **Run tests from Claude** — execute single specs or full suites via MCP tools
- **Headed mode** — watch tests run in a visible browser window for debugging
- **Artifact access** — retrieve failure screenshots and video recordings
- **Persistent results** — review the last test run without re-executing
- **Dev server validation** — checks that your app is running before executing tests
- **Browser selection** — Chrome, Firefox, Edge, or Electron
- **Glob filtering** — run subsets of specs with pattern matching

## How It Works

```
Claude ──(MCP/stdio)──> cypress-mcp-server ──> Cypress ──> Browser
                              │
                              ├── results + pass/fail summary
                              ├── failure screenshots
                              └── video recordings
```

Claude sends tool calls over the MCP protocol. The server spawns Cypress, captures structured results, and returns them as formatted markdown — including test counts, durations, error messages, and paths to artifacts.

## Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `list_specs` | List all Cypress spec files in the project | `folder` (default: `cypress/e2e`) |
| `run_spec` | Run a single spec file | `spec` (required), `browser`, `headed` |
| `run_all` | Run all specs or a filtered subset | `specPattern`, `browser` |
| `get_last_results` | Retrieve the most recent test run results | — |
| `get_screenshot` | Find failure screenshots | `spec`, `testTitle` |
| `get_video` | Find test video recordings | `spec` |

## Getting Started

### Prerequisites

- Node.js 18+
- A Cypress project with specs to run

### Install & Build

```bash
git clone https://github.com/hidaroz/cypress-mcp-server.git
cd cypress-mcp-server
npm install
npm run build
```

### Run

```bash
CYPRESS_PROJECT_PATH=/path/to/your/cypress-project npm start
```

For development:

```bash
CYPRESS_PROJECT_PATH=/path/to/your/cypress-project npm run dev
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CYPRESS_PROJECT_PATH` | Yes | Absolute path to the Cypress project |
| `LOG_LEVEL` | No | `debug`, `info`, `warn`, or `error` (default: `info`) |

### Claude Code

Add to your MCP settings (`.claude/settings.json` or project-level):

```json
{
  "mcpServers": {
    "cypress": {
      "command": "node",
      "args": ["/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_PROJECT_PATH": "/path/to/your/cypress-project"
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cypress": {
      "command": "node",
      "args": ["/path/to/cypress-mcp-server/dist/index.js"],
      "env": {
        "CYPRESS_PROJECT_PATH": "/path/to/your/cypress-project"
      }
    }
  }
}
```

## Project Structure

```
src/
├── index.ts                 # Entry point, stdio transport setup
├── server.ts                # MCP server creation and tool registration
├── tools/
│   ├── list-specs.ts        # Discover spec files
│   ├── run-spec.ts          # Run single spec
│   ├── run-all.ts           # Run multiple specs
│   ├── get-last-results.ts  # Retrieve cached results
│   ├── get-screenshot.ts    # Find screenshot artifacts
│   ├── get-video.ts         # Find video artifacts
│   └── format.ts            # Format results as markdown
├── cypress/
│   ├── runner.ts            # Cypress execution and result parsing
│   └── results-store.ts     # JSON persistence for test results
└── utils/
    ├── errors.ts            # Custom error classes
    └── logger.ts            # Structured JSON logging
```

## Tech Stack

- **[Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)** — MCP server framework
- **[Cypress](https://www.cypress.io/)** — E2E testing framework
- **TypeScript** — type-safe implementation
- **[Zod](https://zod.dev/)** — runtime input validation

## License

MIT
