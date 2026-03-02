/**
 * Sanity CMS client
 * Configure with NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET
 */

import { createClient } from "@sanity/client";
import { safeEnv } from "@/utils/safeEnv";

function getSanityClient() {
  const projectId = safeEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") || "placeholder";
  const dataset = safeEnv("NEXT_PUBLIC_SANITY_DATASET") || "production";
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: safeEnv("NODE_ENV") === "production",
  });
}

let _client: ReturnType<typeof createClient> | null = null;

export function sanityClient() {
  if (!_client) _client = getSanityClient();
  return _client;
}
