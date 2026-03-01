/**
 * Safe env access for optional config. Returns empty string when missing.
 */
export function safeEnv(key: string): string {
  if (typeof process === "undefined" || !process.env) return "";
  return process.env[key] ?? "";
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    safeEnv("CLOUDINARY_CLOUD_NAME") &&
    safeEnv("CLOUDINARY_API_KEY") &&
    safeEnv("CLOUDINARY_API_SECRET")
  );
}

export function isStripeConfigured(): boolean {
  return !!safeEnv("STRIPE_SECRET_KEY");
}

export function isPostmarkConfigured(): boolean {
  return !!safeEnv("POSTMARK_SERVER_TOKEN");
}

export function isResendConfigured(): boolean {
  return !!safeEnv("RESEND_API_KEY");
}

export function databaseConfigured(): boolean {
  return !!safeEnv("DATABASE_URL");
}

export function isShopifyConfigured(): boolean {
  return (
    !!safeEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN") &&
    !!safeEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN")
  );
}

export function getDefaultBranchCode(): string {
  return safeEnv("DEFAULT_BRANCH_CODE") || "";
}
