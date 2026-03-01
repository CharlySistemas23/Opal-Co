import { test, expect } from "@playwright/test";

test("cart drawer opens and shows content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Open cart|Bag/i }).click();
  await expect(page.getByRole("heading", { name: /Your Bag/i })).toBeVisible({
    timeout: 3000,
  });
  await expect(
    page.getByText(/Shopping bag is unavailable|Your bag is empty/i)
  ).toBeVisible({ timeout: 2000 });
});
