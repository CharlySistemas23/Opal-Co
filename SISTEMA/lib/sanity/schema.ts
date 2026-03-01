/**
 * Sanity schema references
 * See lib/sanity/schemas/ for full definitions
 */

export { collectionSchema, productSchema, journalEntrySchema, manifestoBlockSchema, siteSettingsSchema } from "./schemas";

export const schemaTypes = [
  "collection",
  "product",
  "journalEntry",
  "manifestoBlock",
  "siteSettings",
] as const;
