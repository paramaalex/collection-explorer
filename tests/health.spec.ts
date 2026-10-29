import { test, expect } from "@playwright/test";

test("health endpoint reports service identity and version", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const data = await response.json();
  expect(data.status).toBe("ok");
  expect(data.service).toBe("collection-explorer");
  expect(data.version).toMatch(/^\d+\.\d+\.\d+$/);
  expect(Number.isNaN(Date.parse(data.checkedAt))).toBe(false);
});
