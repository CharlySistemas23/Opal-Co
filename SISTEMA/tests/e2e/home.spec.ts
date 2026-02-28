import { test, expect } from "@playwright/test";

test("home loads and has OPAL & CO visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "OPAL & CO" })).toBeVisible();
  await expect(page.locator("text=OPAL & CO").first()).toBeVisible();
});
