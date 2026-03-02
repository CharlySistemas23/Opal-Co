import type { Product } from "./product";

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: {
    url: string;
    altText: string | null;
  };
  products: Product[];
}

export interface HighJewelryPiece {
  id: string;
  handle: string;
  title: string;
  description: string;
  material?: string;
  image: {
    url: string;
    altText: string | null;
  };
  priceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
}
