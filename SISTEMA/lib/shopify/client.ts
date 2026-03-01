/**
 * Shopify Storefront API client
 * Placeholder - configure with SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN
 */

import { safeEnv } from "@/utils/safeEnv";

const domain = safeEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
const storefrontAccessToken = safeEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN");

export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ data: T }> {
  const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.errors?.[0]?.message ?? "Shopify API error");
  }
  return json;
}
