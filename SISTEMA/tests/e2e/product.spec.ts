import { test, expect } from "@playwright/test";

test("product PDP loads for mock handle radiance-ring", async ({ page }) => {
  await page.goto("/products/radiance-ring");
  await expect(page.getByRole("heading", { name: /Radiance Ring/i })).toBeVisible();
});
