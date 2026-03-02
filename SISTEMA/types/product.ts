export interface ProductImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
}
