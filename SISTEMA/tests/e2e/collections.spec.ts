import { test, expect } from "@playwright/test";

test("collections page loads and shows heading", async ({ page }) => {
  await page.goto("/collections");
  await expect(page.getByRole("heading", { name: /Collections/i })).toBeVisible();
});
