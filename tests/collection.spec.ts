import { test, expect } from "@playwright/test";

test("empty search displays all six records", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("status")).toHaveText("6 results found.");
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("search finds matching landscapes and opens details", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search collection").fill("landscape");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("status")).toHaveText("2 results found.");
  await expect(page.getByRole("article")).toHaveCount(2);

  const coastal = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Coastal landscape", exact: true }),
  });

  await coastal.locator("summary").click();
  await expect(coastal.getByText("demo-001", { exact: true })).toBeVisible();
  await expect(coastal.getByText("1920", { exact: true })).toBeVisible();
});

test("category filter returns only photographs", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Category").selectOption("Photography");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("status")).toHaveText("2 results found.");
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(2);

  for (const card of await cards.all()) {
    await expect(card.getByText("Photography", { exact: true })).toBeVisible();
  }
});

test("unmatched search displays a helpful empty state", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Search collection").fill("zzzz");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("status")).toHaveText("0 results found.");
  await expect(page.getByText(/No matches\. Try another search/)).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("server error is displayed and a retry succeeds", async ({ page }) => {
  await page.route("**/api/collection?**", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Temporarily unavailable" }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("alert")).toContainText("HTTP 503");
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeEnabled();

  await page.unroute("**/api/collection?**");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("status")).toHaveText("6 results found.");
  await expect(page.getByRole("region", { name: "Collection results" }).getByRole("alert")).toHaveCount(0);
});

test("API combines a trimmed search with a category filter", async ({ request }) => {
  const response = await request.get("/api/collection", {
    params: { q: "  LANDSCAPE  ", category: "Art" },
  });

  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.total).toBe(2);
  expect(data.items.map((item: { id: string }) => item.id)).toEqual([
    "demo-001",
    "demo-004",
  ]);
});

test("API rejects unsupported categories", async ({ request }) => {
  const response = await request.get("/api/collection", {
    params: { category: "Unsupported" },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: "Unsupported category." });
});

test("API rejects searches longer than 100 characters", async ({ request }) => {
  const response = await request.get("/api/collection", {
    params: { q: "x".repeat(101) },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: "Search must be 100 characters or fewer.",
  });
});


