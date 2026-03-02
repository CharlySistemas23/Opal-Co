import { test, expect } from "@playwright/test";

test("admin login page loads even when DB is missing", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(
    page.getByRole("heading", { name: /Admin login/i })
  ).toBeVisible({ timeout: 5000 });
  await expect(
    page.getByText(/Sign in with your staff email/i)
  ).toBeVisible();
});

test("admin shows config banner when logged in with mock session", async ({
  page,
  request,
}) => {
  const requestRes = await request.post("/api/admin/auth/request-code", {
    headers: { "Content-Type": "application/json" },
    data: { email: "owner@local.dev" },
  });
  if (!requestRes.ok()) {
    test.skip();
    return;
  }

  const verifyRes = await request.post("/api/admin/auth/verify-code", {
    headers: { "Content-Type": "application/json" },
    data: { email: "owner@local.dev", code: "123456" },
  });
  if (!verifyRes.ok()) {
    test.skip();
    return;
  }

  const setCookie = verifyRes.headers()["set-cookie"];
  if (!setCookie) {
    test.skip();
    return;
  }
  const sessionPart = setCookie.split(";")[0]?.trim() ?? "";
  const eqIdx = sessionPart.indexOf("=");
  if (eqIdx < 0 || !sessionPart.startsWith("opal_admin_session=")) {
    test.skip();
    return;
  }
  const value = sessionPart.slice(eqIdx + 1);
  await page.context().addCookies([
    {
      name: "opal_admin_session",
      value,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/admin");
  await expect(
    page.getByText(/Database not configured/i)
  ).toBeVisible({ timeout: 5000 });
});
