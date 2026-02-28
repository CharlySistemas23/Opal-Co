import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { formatPrice } from "./formatPrice";
import {
  safeEnv,
  isCloudinaryConfigured,
  isStripeConfigured,
  isPostmarkConfigured,
  isResendConfigured,
  databaseConfigured,
  isShopifyConfigured,
} from "./safeEnv";

describe("formatPrice", () => {
  it("formats USD with no decimals", () => {
    expect(formatPrice("12500", "USD")).toBe("$12,500");
  });

  it("formats zero and small amounts", () => {
    expect(formatPrice("0", "USD")).toBe("$0");
    expect(formatPrice("89.5", "USD")).toBe("$90");
  });
});

describe("safeEnv", () => {
  it("returns empty string for missing key", () => {
    expect(safeEnv("NONEXISTENT_KEY")).toBe("");
  });
});

describe("safeEnv config helpers", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("isCloudinaryConfigured returns false when CLOUDINARY_CLOUD_NAME is missing", () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    expect(isCloudinaryConfigured()).toBe(false);
  });

  it("isCloudinaryConfigured returns true when all three vars are set", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "my-cloud";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    expect(isCloudinaryConfigured()).toBe(true);
  });

  it("isStripeConfigured returns false when STRIPE_SECRET_KEY is missing", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
  });

  it("isStripeConfigured returns true when STRIPE_SECRET_KEY is set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
    expect(isStripeConfigured()).toBe(true);
  });

  it("isPostmarkConfigured returns false when POSTMARK_SERVER_TOKEN is missing", () => {
    delete process.env.POSTMARK_SERVER_TOKEN;
    expect(isPostmarkConfigured()).toBe(false);
  });

  it("isPostmarkConfigured returns true when POSTMARK_SERVER_TOKEN is set", () => {
    process.env.POSTMARK_SERVER_TOKEN = "xxx";
    expect(isPostmarkConfigured()).toBe(true);
  });

  it("isResendConfigured returns false when RESEND_API_KEY is missing", () => {
    delete process.env.RESEND_API_KEY;
    expect(isResendConfigured()).toBe(false);
  });

  it("isResendConfigured returns true when RESEND_API_KEY is set", () => {
    process.env.RESEND_API_KEY = "re_xxx";
    expect(isResendConfigured()).toBe(true);
  });

  it("databaseConfigured returns false when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(databaseConfigured()).toBe(false);
  });

  it("databaseConfigured returns true when DATABASE_URL is set", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test";
    expect(databaseConfigured()).toBe(true);
  });

  it("isShopifyConfigured returns false when vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    delete process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    expect(isShopifyConfigured()).toBe(false);
  });

  it("isShopifyConfigured returns false when only one var is set", () => {
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = "store.myshopify.com";
    delete process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    expect(isShopifyConfigured()).toBe(false);
  });

  it("isShopifyConfigured returns true when both vars are set", () => {
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = "store.myshopify.com";
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN = "xxx";
    expect(isShopifyConfigured()).toBe(true);
  });
});
