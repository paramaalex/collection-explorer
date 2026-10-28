import { test, expect } from "@playwright/test";

test("search and object details work using the keyboard", async ({ page }) => {
  await page.goto("/");

  const query = page.getByLabel("Search collection");
  await query.focus();
  await expect(query).toBeFocused();

  await page.keyboard.type("landscape");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Category")).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", {
    name: "Search",
    exact: true,
  })).toBeFocused();

  await page.keyboard.press("Enter");

  const results = page.getByRole("region", { name: "Collection results" });
  await expect(results.getByRole("status")).toHaveText("2 results found.");

  await page.keyboard.press("Tab");
  const summary = results.locator("summary").first();
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(
    results.getByText("demo-001", { exact: true }),
  ).toBeVisible();
});

test("mobile layout fits the viewport and search remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Search", exact: true }).click();
  const results = page.getByRole("region", { name: "Collection results" });
  await expect(results.getByRole("article")).toHaveCount(6);

  const fitsViewport = await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth,
  );
  expect(fitsViewport).toBe(true);

  await expect(page.getByLabel("Search collection")).toBeVisible();
  await expect(page.getByLabel("Category")).toBeVisible();
});
