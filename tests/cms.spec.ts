import { test, expect } from "@playwright/test";

const record = {
  id: "demo-cms-001",
  title: "Coastal landscape",
  description: "Updated through Strapi and delivered through GraphQL.",
  category: "Art",
  year: 1920,
};

test("CMS collection displays retrieved content", async ({ page }) => {
  await page.route("**/api/cms", async (route) => {
    await route.fulfill({
      json: { items: [record], source: "Local Strapi CMS via GraphQL" },
    });
  });

  await page.goto("/");
  const section = page.getByRole("region", { name: "CMS collection" });
  await section.getByRole("button", { name: "Load CMS records" }).click();

  await expect(section.getByRole("status")).toHaveText("1 CMS records loaded.");
  await expect(section.getByRole("heading", {
    name: record.title,
  })).toBeVisible();
  await expect(section.getByText(record.description, { exact: true })).toBeVisible();
  await expect(section.getByText("Year: 1920", { exact: true })).toBeVisible();
});

test("CMS collection shows an empty state", async ({ page }) => {
  await page.route("**/api/cms", async (route) => {
    await route.fulfill({ json: { items: [], source: "Local Strapi CMS" } });
  });

  await page.goto("/");
  const section = page.getByRole("region", { name: "CMS collection" });
  await section.getByRole("button", { name: "Load CMS records" }).click();

  await expect(section.getByText(
    "No published CMS records are available.",
  )).toBeVisible();
  await expect(section.getByRole("article")).toHaveCount(0);
});

test("CMS collection recovers after a service failure", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/cms", async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 502,
        json: { error: "Could not load CMS records." },
      });
    } else {
      await route.fulfill({ json: { items: [record] } });
    }
  });

  await page.goto("/");
  const section = page.getByRole("region", { name: "CMS collection" });
  const button = section.getByRole("button", { name: "Load CMS records" });

  await button.click();
  await expect(section.getByRole("alert")).toContainText(
    "Could not load CMS records.",
  );
  await expect(button).toBeEnabled();

  await button.click();
  await expect(section.getByRole("status")).toHaveText("1 CMS records loaded.");
  await expect(section.getByRole("alert")).toHaveCount(0);
});
