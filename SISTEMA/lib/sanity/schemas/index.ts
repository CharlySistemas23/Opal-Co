/**
 * Sanity schema definitions (for reference - actual schemas live in Sanity Studio)
 * Schemas: Collection, Product, JournalEntry, ManifestoBlock, SiteSettings
 */

export const collectionSchema = {
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug" },
    { name: "description", title: "Description", type: "text" },
    { name: "image", title: "Image", type: "image" },
  ],
};

export const productSchema = {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug" },
    { name: "description", title: "Description", type: "text" },
    { name: "images", title: "Images", type: "array", of: [{ type: "image" }] },
  ],
};

export const journalEntrySchema = {
  name: "journalEntry",
  title: "Journal Entry",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug" },
    { name: "excerpt", title: "Excerpt", type: "text" },
    { name: "body", title: "Body", type: "blockContent" },
    { name: "publishedAt", title: "Published At", type: "datetime" },
    { name: "mainImage", title: "Main Image", type: "image" },
  ],
};

export const manifestoBlockSchema = {
  name: "manifestoBlock",
  title: "Manifesto Block",
  type: "document",
  fields: [
    { name: "headline", title: "Headline", type: "string" },
    { name: "body", title: "Body", type: "text" },
  ],
};

export const siteSettingsSchema = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    { name: "title", title: "Site Title", type: "string" },
    { name: "description", title: "Description", type: "text" },
    { name: "ogImage", title: "Open Graph Image", type: "image" },
  ],
};
