import { test, expect } from "@playwright/test";

const record = {
  item: {
    id: "436535",
    title: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    date: "1889",
    category: "European Paintings",
    sourceUrl: "https://www.metmuseum.org/art/collection/search/436535",
  },
  source: "The Metropolitan Museum of Art",
};

test("live record displays museum metadata and source link", async ({ page }) => {
  await page.route("**/api/met", async (route) => {
    await route.fulfill({ json: record });
  });

  await page.goto("/");
  const section = page.getByRole("region", { name: "Live museum record" });

  await section.getByRole("button", { name: "Load live museum record" }).click();

  await expect(section.getByRole("status")).toHaveText("Museum record loaded.");
  await expect(section.getByRole("heading", {
    name: record.item.title,
  })).toBeVisible();
  await expect(section.getByText(record.item.artist, { exact: true })).toBeVisible();
  await expect(section.getByText(record.item.date, { exact: true })).toBeVisible();
  await expect(section.getByRole("link", {
    name: "View original record at The Met",
  })).toHaveAttribute("href", record.item.sourceUrl);
});

test("live record recovers after an upstream timeout", async ({ page }) => {
  let attempts = 0;

  await page.route("**/api/met", async (route) => {
    attempts += 1;

    if (attempts === 1) {
      await route.fulfill({
        status: 504,
        json: { error: "The museum service took too long to respond." },
      });
    } else {
      await route.fulfill({ json: record });
    }
  });

  await page.goto("/");
  const section = page.getByRole("region", { name: "Live museum record" });
  const button = section.getByRole("button", { name: "Load live museum record" });

  await button.click();
  await expect(section.getByRole("alert")).toContainText("too long");
  await expect(button).toBeEnabled();

  await button.click();
  await expect(section.getByRole("status")).toHaveText("Museum record loaded.");
  await expect(section.getByRole("alert")).toHaveCount(0);
  expect(attempts).toBe(2);
});
