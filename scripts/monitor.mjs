import { appendFile, mkdir } from "node:fs/promises";

const baseUrl = process.env.MONITOR_BASE_URL || "http://localhost:3000";
const checks = [
  {
    path: "/api/health",
    validate: (data) => data.status === "ok",
  },
  {
    path: "/api/collection?q=landscape",
    validate: (data) =>
      data.total === 2 && Array.isArray(data.items) && data.items.length === 2,
  },
];

await mkdir("logs", { recursive: true });
let failures = 0;

for (const check of checks) {
  const started = performance.now();
  let statusCode = null;
  let error = null;

  try {
    const response = await fetch(new URL(check.path, baseUrl), {
      signal: AbortSignal.timeout(10000),
    });

    statusCode = response.status;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!check.validate(data)) {
      throw new Error("Response failed the expected-content check");
    }
  } catch (problem) {
    failures += 1;
    error = problem instanceof Error ? problem.message : "Unknown failure";
  }

  const result = {
    checkedAt: new Date().toISOString(),
    url: new URL(check.path, baseUrl).href,
    ok: error === null,
    statusCode,
    durationMs: Math.round(performance.now() - started),
    error,
  };

  await appendFile("logs/monitor.jsonl", JSON.stringify(result) + "\n");
  console.log(JSON.stringify(result));
}

console.log(`${checks.length - failures}/${checks.length} checks passed.`);
process.exitCode = failures > 0 ? 1 : 0;
