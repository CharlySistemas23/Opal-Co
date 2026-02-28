import { test, expect } from "@playwright/test";

test("checkout page loads", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: /Checkout/i })).toBeVisible();
  await expect(page.getByText(/not configured|Payment is not configured|Your cart is empty/i)).toBeVisible({ timeout: 3000 });
});
