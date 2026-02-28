/**
 * Sanity GROQ queries
 */

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  title,
  description,
  ogImage
}`;

export const MANIFESTO_BLOCK_QUERY = `*[_type == "manifestoBlock"][0]{
  _id,
  headline,
  body
}`;

export const JOURNAL_ENTRIES_QUERY = `*[_type == "journalEntry"] | order(publishedAt desc) [0...10]{
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  mainImage {
    asset-> {
      url
    }
  }
}`;

export const JOURNAL_ENTRY_BY_SLUG_QUERY = `*[_type == "journalEntry" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  body,
  publishedAt,
  mainImage {
    asset-> {
      url
    }
  }
}`;
