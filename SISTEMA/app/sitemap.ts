import { MetadataRoute } from "next";
import { safeEnv } from "@/utils/safeEnv";
import { getCollections, getProducts } from "@/lib/shopify";
import { getJournalEntries } from "@/lib/sanity";
import storesData from "@/data/mock-stores.json";
import faqData from "@/data/mock-faq.json";

const baseUrl = safeEnv("NEXT_PUBLIC_SITE_URL") || "https://opal-and-co.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/high-jewelry`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/the-house`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/journal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/private-clients`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/appointments`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/stores`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/legal/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/returns`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const [collections, journalEntries] = await Promise.all([
    getCollections(),
    getJournalEntries(),
  ]);
  const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const products = await getProducts(100);
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const journalPages: MetadataRoute.Sitemap = journalEntries
    .filter((e) => e.slug?.current)
    .map((e) => ({
      url: `${baseUrl}/journal/${e.slug!.current}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const storeSlugs = (storesData as Array<{ slug: string }>).map((s) => s.slug);
  const storesPages: MetadataRoute.Sitemap = storeSlugs.map((slug) => ({
    url: `${baseUrl}/stores/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const faqSlugs = (faqData as Array<{ slug: string }>).map((f) => f.slug);
  const faqPages: MetadataRoute.Sitemap = faqSlugs.map((slug) => ({
    url: `${baseUrl}/faq/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [...staticPages, ...collectionPages, ...productPages, ...journalPages, ...storesPages, ...faqPages];
}
