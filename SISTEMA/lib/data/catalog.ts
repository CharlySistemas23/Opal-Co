import { databaseConfigured } from "@/utils/safeEnv";
import { getProducts, getProductByHandle } from "@/lib/shopify";
import { getProducts as getDbProducts, getProductByHandle as getDbProductByHandle } from "@/lib/data/products";
import { getCollections, getCollectionByHandle } from "@/lib/shopify";
import { getCollections as getDbCollections, getCollectionBySlug as getDbCollectionBySlug } from "@/lib/data/collections";

export interface PublicProduct {
  id: string;
  handle: string;
  title: string;
  material?: string;
  price: string;
  currencyCode: string;
  description: string | null;
  careText?: string | null;
  detailsText?: string | null;
  images: Array<{ url: string; altText: string | null }>;
  variantId: string;
  byInquiry: boolean;
}

export interface PublicCollection {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  image?: string;
  products: Array<{
    id: string;
    handle: string;
    title: string;
    productType?: string;
    image?: { url: string; altText: string | null };
  }>;
}

const PLACEHOLDER_PRODUCTS: Record<string, PublicProduct> = {
  "radiance-ring": {
    id: "placeholder-radiance-ring",
    handle: "radiance-ring",
    title: "Radiance Ring",
    material: "18K Yellow Gold, Diamonds",
    price: "12500",
    currencyCode: "USD",
    description: "A ring that catches light. For moments that deserve to be marked.",
    images: [
      { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80", altText: "Radiance Ring" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Radiance Ring detail" },
    ],
    variantId: "placeholder",
    byInquiry: true,
  },
  "luminance-necklace": {
    id: "placeholder-luminance-necklace",
    handle: "luminance-necklace",
    title: "Luminance Necklace",
    material: "Platinum, Sapphires",
    price: "18900",
    currencyCode: "USD",
    description: "Light captured. A piece that defines presence.",
    images: [
      { url: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80", altText: "Luminance Necklace" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Luminance Necklace detail" },
    ],
    variantId: "placeholder",
    byInquiry: true,
  },
  "serenity-earrings": {
    id: "placeholder-serenity-earrings",
    handle: "serenity-earrings",
    title: "Serenity Earrings",
    material: "18K White Gold, Pearls",
    price: "8900",
    currencyCode: "USD",
    description: "Understated elegance. For everyday refinement.",
    images: [
      { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80", altText: "Serenity Earrings" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Serenity Earrings detail" },
    ],
    variantId: "placeholder",
    byInquiry: true,
  },
  "essence-bracelet": {
    id: "placeholder-essence-bracelet",
    handle: "essence-bracelet",
    title: "Essence Bracelet",
    material: "Rose Gold, Diamonds",
    price: "14200",
    currencyCode: "USD",
    description: "A line that follows the wrist. Minimal. Essential.",
    images: [
      { url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&q=80", altText: "Essence Bracelet" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Essence Bracelet detail" },
    ],
    variantId: "placeholder",
    byInquiry: true,
  },
};

const PLACEHOLDER_COLLECTIONS = [
  { id: "1", handle: "signature", title: "Signature Collection", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80" },
  { id: "2", handle: "for-herself", title: "For Herself", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80" },
  { id: "3", handle: "for-her", title: "For Her", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80" },
  { id: "4", handle: "high-jewelry", title: "High Jewelry", image: "https://images.unsplash.com/photo-1558858728-f4921d58d3d5?w=1200&q=80" },
];

const PLACEHOLDER_COLLECTION_PRODUCTS = [
  { id: "1", handle: "radiance-ring", title: "Radiance Ring", image: { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80", altText: "Radiance Ring" as string | null } },
  { id: "2", handle: "luminance-necklace", title: "Luminance Necklace", image: { url: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80", altText: "Luminance Necklace" as string | null } },
  { id: "3", handle: "serenity-earrings", title: "Serenity Earrings", image: { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80", altText: "Serenity Earrings" as string | null } },
  { id: "4", handle: "essence-bracelet", title: "Essence Bracelet", image: { url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&q=80", altText: "Essence Bracelet" as string | null } },
];

const DEFAULT_PLACEHOLDER_PRODUCT = PLACEHOLDER_PRODUCTS["radiance-ring"]!;

function mapDbProductToPublic(
  p: Awaited<ReturnType<typeof getDbProductByHandle>>
): PublicProduct | null {
  if (!p) return null;
  const images = p.images.map((i) => ({
    url: i.mediaAsset?.url ?? "",
    altText: i.mediaAsset?.alt ?? null,
  })).filter((i) => i.url);
  const variant = p.variants[0];
  const price = variant ? String(Math.round(variant.priceCents / 100)) : "0";
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    material: p.materialSummary ?? undefined,
    price,
    currencyCode: variant?.currency ?? "USD",
    description: p.description,
    careText: (p as { careText?: string | null }).careText ?? null,
    detailsText: (p as { detailsText?: string | null }).detailsText ?? null,
    images: images.length > 0 ? images : [{ url: "", altText: null }],
    variantId: variant?.id ?? "",
    byInquiry: p.byInquiry,
  };
}

export async function getProductForPublic(handle: string): Promise<PublicProduct | null> {
  if (databaseConfigured()) {
    const dbProduct = await getDbProductByHandle(handle);
    if (dbProduct) {
      return mapDbProductToPublic(dbProduct);
    }
  }
  const shopifyProduct = await getProductByHandle(handle);
  if (shopifyProduct) {
    return {
      id: shopifyProduct.id,
      handle: shopifyProduct.handle,
      title: shopifyProduct.title,
      material: shopifyProduct.vendor || shopifyProduct.productType || undefined,
      price: shopifyProduct.priceRange.minVariantPrice.amount,
      currencyCode: shopifyProduct.priceRange.minVariantPrice.currencyCode,
      description: shopifyProduct.description ?? null,
      images: shopifyProduct.images.map((i) => ({ url: i.url, altText: i.altText })),
      variantId: shopifyProduct.variants[0]?.id ?? "",
      byInquiry: false,
    };
  }
  return PLACEHOLDER_PRODUCTS[handle] ?? null;
}

export async function getProductForPublicWithFallback(handle: string): Promise<PublicProduct> {
  const product = await getProductForPublic(handle);
  return product ?? { ...DEFAULT_PLACEHOLDER_PRODUCT, id: "placeholder", handle, title: "Product", description: "" };
}

export async function getProductsForPublic(first = 12): Promise<PublicProduct[]> {
  if (databaseConfigured()) {
    const dbProducts = await getDbProducts(first);
    if (dbProducts.length > 0) {
      return dbProducts.map((p) => {
        const images = p.images.map((i) => ({
          url: i.mediaAsset?.url ?? "",
          altText: i.mediaAsset?.alt ?? null,
        })).filter((i) => i.url);
        const v = p.variants[0];
        return {
          id: p.id,
          handle: p.handle,
          title: p.title,
          material: p.materialSummary ?? undefined,
          price: v ? String(Math.round(v.priceCents / 100)) : "0",
          currencyCode: v?.currency ?? "USD",
          description: p.description,
          images: images.length > 0 ? images : [{ url: "", altText: null }],
          variantId: v?.id ?? "",
          byInquiry: p.byInquiry,
        };
      });
    }
  }
  const shopifyProducts = await getProducts(first);
  if (shopifyProducts.length > 0) {
    return shopifyProducts.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      material: p.vendor || p.productType || undefined,
      price: p.priceRange.minVariantPrice.amount,
      currencyCode: p.priceRange.minVariantPrice.currencyCode,
      description: p.description ?? null,
      images: p.images.map((i) => ({ url: i.url, altText: i.altText })),
      variantId: p.variants[0]?.id ?? "",
      byInquiry: false,
    }));
  }
  return Object.entries(PLACEHOLDER_PRODUCTS).slice(0, first).map(([, p]) => ({ ...p }));
}

export async function getCollectionsForPublic(): Promise<Array<{ id: string; handle: string; title: string; image: string }>> {
  if (databaseConfigured()) {
    const dbCollections = await getDbCollections();
    if (dbCollections.length > 0) {
      return dbCollections.map((c) => ({
        id: c.id,
        handle: c.slug,
        title: c.title,
        image: c.productCollections[0]?.product?.images[0]?.mediaAsset?.url ?? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
      }));
    }
  }
  const shopifyCollections = await getCollections();
  if (shopifyCollections.length > 0) {
    return shopifyCollections.map((c) => ({
      id: c.id,
      handle: c.handle,
      title: c.title,
      image: c.image?.url ?? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
    }));
  }
  return PLACEHOLDER_COLLECTIONS;
}

export async function getCollectionForPublic(
  handle: string,
  first = 24
): Promise<PublicCollection | null> {
  if (databaseConfigured()) {
    const dbCollection = await getDbCollectionBySlug(handle, first);
    if (dbCollection && "productCollections" in dbCollection) {
      const productCollections = dbCollection.productCollections as Array<{
        product: { id: string; handle: string; title: string; images: Array<{ mediaAsset: { url: string; alt: string | null } | null }> } | null;
      }>;
      const products = productCollections
        .map((pc) => pc.product)
        .filter((p): p is NonNullable<typeof p> => p != null)
        .map((p) => ({
          id: p.id,
          handle: p.handle,
          title: p.title,
          productType: undefined as string | undefined,
          image: p.images[0]?.mediaAsset
            ? { url: p.images[0].mediaAsset!.url, altText: p.images[0].mediaAsset!.alt }
            : undefined,
        }));
      return {
        id: dbCollection.id,
        handle: dbCollection.slug,
        title: dbCollection.title,
        description: dbCollection.description,
        image: products[0]?.image?.url,
        products,
      };
    }
  }
  const shopifyCollection = await getCollectionByHandle(handle, first);
  if (shopifyCollection) {
    return {
      id: shopifyCollection.id,
      handle: shopifyCollection.handle,
      title: shopifyCollection.title,
      description: shopifyCollection.description ?? null,
      image: shopifyCollection.image?.url,
      products: shopifyCollection.products.map((p) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        productType: p.productType ?? undefined,
        image: p.images[0] ? { url: p.images[0].url, altText: p.images[0].altText } : undefined,
      })),
    };
  }
  return {
    id: "placeholder",
    handle,
    title: handle.replace(/-/g, " "),
    description: null,
    products: PLACEHOLDER_COLLECTION_PRODUCTS,
  };
}
