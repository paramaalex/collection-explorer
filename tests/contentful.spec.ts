import { test, expect } from "@playwright/test";

test("Contentful collection displays published records", async ({ page }) => {
  await page.route("**/api/contentful", async (route) => {
    await route.fulfill({
      json: {
        items: [{
          id: "contentful-demo",
          title: "Harbour photograph",
          description: "Published through Contentful.",
          category: "Photography",
          year: 1948,
        }],
        source: "Contentful SaaS CMS via GraphQL",
      },
    });
  });

  await page.goto("/");
  const section = page.getByRole("region", {
    name: "Contentful collection",
    exact: true,
  });

  await section.getByRole("button", {
    name: "Load Contentful records",
    exact: true,
  }).click();

  await expect(section.getByRole("heading", {
    name: "Harbour photograph",
  })).toBeVisible();
  await expect(section.getByText("Published through Contentful.")).toBeVisible();
  await expect(section.getByText("Year: 1948")).toBeVisible();
});

test("Contentful collection recovers after a service failure", async ({ page }) => {
  let requests = 0;

  await page.route("**/api/contentful", async (route) => {
    requests++;

    if (requests === 1) {
      await route.fulfill({
        status: 502,
        json: { error: "The cloud CMS is unavailable. Please retry." },
      });
      return;
    }

    await route.fulfill({
      json: {
        items: [],
        source: "Contentful SaaS CMS via GraphQL",
      },
    });
  });

  await page.goto("/");
  const section = page.getByRole("region", {
    name: "Contentful collection",
    exact: true,
  });
  const button = section.getByRole("button", {
    name: "Load Contentful records",
    exact: true,
  });

  await button.click();
  await expect(section.getByRole("alert")).toContainText("unavailable");
  await expect(button).toBeEnabled();

  await button.click();
  await expect(section.getByRole("alert")).toHaveCount(0);
  await expect(section.getByText(
    "No published Contentful records are available.",
  )).toBeVisible();
});
