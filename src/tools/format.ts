import type { RunSummary } from "../cypress/runner.js";

export function formatSummary(summary: RunSummary): string {
  const icon = summary.status === "passed" ? "PASSED" : "FAILED";
  const lines: string[] = [
    `## Test Run: ${icon}`,
    "",
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total  | ${summary.totalTests} |`,
    `| Passed | ${summary.passed} |`,
    `| Failed | ${summary.failed} |`,
    `| Pending | ${summary.pending} |`,
    `| Duration | ${(summary.duration / 1000).toFixed(1)}s |`,
    "",
  ];

  for (const spec of summary.specs) {
    lines.push(`### ${spec.name}`);
    for (const test of spec.tests) {
      const title = test.title.join(" > ");
      const status =
        test.state === "passed" ? "PASS" :
        test.state === "failed" ? "FAIL" :
        "SKIP";
      lines.push(`- [${status}] ${title} (${test.duration}ms)`);
      if (test.error) {
        const truncated = test.error.length > 300
          ? test.error.slice(0, 300) + "..."
          : test.error;
        lines.push(`  Error: ${truncated}`);
      }
    }
    lines.push("");
  }

  if (summary.screenshots.length > 0) {
    lines.push("### Screenshots");
    for (const s of summary.screenshots) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  if (summary.videos.length > 0) {
    lines.push("### Videos");
    for (const v of summary.videos) {
      lines.push(`- ${v}`);
    }
  }

  return lines.join("\n");
}
