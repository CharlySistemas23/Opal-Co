import { safeEnv } from "@/utils/safeEnv";
import { sanityClient } from "./client";
import {
  SITE_SETTINGS_QUERY,
  MANIFESTO_BLOCK_QUERY,
  JOURNAL_ENTRIES_QUERY,
  JOURNAL_ENTRY_BY_SLUG_QUERY,
} from "./queries";

export interface SiteSettings {
  title?: string;
  description?: string;
  ogImage?: { asset?: { url: string } };
}

export interface ManifestoBlock {
  _id: string;
  headline?: string;
  body?: string;
}

export interface JournalEntry {
  _id: string;
  title?: string;
  slug?: { current: string };
  excerpt?: string;
  publishedAt?: string;
  mainImage?: { asset?: { url: string } };
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const hasConfig =
    !!safeEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") && !!safeEnv("NEXT_PUBLIC_SANITY_DATASET");
  if (!hasConfig) return null;

  try {
    return await sanityClient().fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
  } catch {
    return null;
  }
}

export async function getManifestoBlock(): Promise<ManifestoBlock | null> {
  const hasConfig =
    !!safeEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") && !!safeEnv("NEXT_PUBLIC_SANITY_DATASET");
  if (!hasConfig) return null;

  try {
    return await sanityClient().fetch<ManifestoBlock | null>(MANIFESTO_BLOCK_QUERY);
  } catch {
    return null;
  }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const hasConfig =
    !!safeEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") && !!safeEnv("NEXT_PUBLIC_SANITY_DATASET");
  if (!hasConfig) return [];

  try {
    return await sanityClient().fetch<JournalEntry[]>(JOURNAL_ENTRIES_QUERY);
  } catch {
    return [];
  }
}

export async function getJournalEntryBySlug(slug: string) {
  const hasConfig =
    !!safeEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") && !!safeEnv("NEXT_PUBLIC_SANITY_DATASET");
  if (!hasConfig) return null;

  try {
    return await sanityClient().fetch(JOURNAL_ENTRY_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}
