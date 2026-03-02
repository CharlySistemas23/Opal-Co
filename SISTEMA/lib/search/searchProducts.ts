import { getProductsForPublic } from "@/lib/data/catalog";
import { MOCK_PRODUCTS } from "./mockProducts";

export interface SearchProduct {
  handle: string;
  title: string;
  material?: string;
  price: string;
  byInquiry: boolean;
  image?: string;
}

function searchMock(query: string): SearchProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.material?.toLowerCase().includes(q) ?? false) ||
      p.handle.toLowerCase().includes(q)
  ).map((p) => ({
    handle: p.handle,
    title: p.title,
    material: p.material,
    price: p.price,
    byInquiry: p.byInquiry,
    image: p.image,
  }));
}

export async function searchProducts(query: string): Promise<SearchProduct[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const products = await getProductsForPublic(50);
    if (products.length === 0) return searchMock(q);
    const lower = q.toLowerCase();
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          (p.material?.toLowerCase().includes(lower) ?? false) ||
          p.handle.toLowerCase().includes(lower)
      )
      .map((p) => ({
        handle: p.handle,
        title: p.title,
        material: p.material,
        price: p.price,
        byInquiry: p.byInquiry,
        image: p.images[0]?.url,
      }));
  } catch {
    return searchMock(q);
  }
}
