export type PageBlockType =
  | "HERO"
  | "MANIFESTO"
  | "FEATURED_PRODUCTS"
  | "DUAL_NARRATIVE"
  | "HIGH_JEWELRY"
  | "CRAFT"
  | "CTA"
  | "RICH_TEXT"
  | "GALLERY"
  | "FAQ_LIST";

export interface HeroBlockData {
  headline: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  backgroundMediaAssetId?: string | null;
  backgroundImageUrl?: string;
}

export interface ManifestoBlockData {
  headline: string;
  body: string;
}

export interface FeaturedProductsBlockData {
  productHandles: string[];
  limit?: number;
}

export interface DualNarrativeBlockData {
  leftTitle: string;
  leftText: string;
  leftMediaAssetId?: string | null;
  leftImageUrl?: string;
  rightTitle: string;
  rightText: string;
  rightMediaAssetId?: string | null;
  rightImageUrl?: string;
}

export interface HighJewelryBlockData {
  productHandles?: string[];
  limit?: number;
}

export interface CraftBlockData {
  heading: string;
  body: string;
  mediaAssetId?: string | null;
  imageUrl?: string;
}

export interface CtaBlockData {
  title: string;
  ctaText: string;
  ctaHref: string;
}

export interface RichTextBlockData {
  content: string;
}

export interface GalleryBlockData {
  images: Array<{ url?: string; alt?: string; mediaAssetId?: string }>;
}

export interface FaqListBlockData {
  items: Array<{ question: string; answer: string }>;
}

export type BlockDataMap = {
  HERO: HeroBlockData;
  MANIFESTO: ManifestoBlockData;
  FEATURED_PRODUCTS: FeaturedProductsBlockData;
  DUAL_NARRATIVE: DualNarrativeBlockData;
  HIGH_JEWELRY: HighJewelryBlockData;
  CRAFT: CraftBlockData;
  CTA: CtaBlockData;
  RICH_TEXT: RichTextBlockData;
  GALLERY: GalleryBlockData;
  FAQ_LIST: FaqListBlockData;
};

export const BLOCK_DATA_DEFAULTS: Record<PageBlockType, object> = {
  HERO: {
    headline: "",
    subheadline: "",
    ctaLabel: "",
    ctaHref: "",
    backgroundImageUrl: "",
  },
  MANIFESTO: {
    headline: "The Manifesto",
    body: "",
  },
  FEATURED_PRODUCTS: {
    productHandles: [],
    limit: 4,
  },
  DUAL_NARRATIVE: {
    leftTitle: "",
    leftText: "",
    leftImageUrl: "",
    rightTitle: "",
    rightText: "",
    rightImageUrl: "",
  },
  HIGH_JEWELRY: {
    productHandles: [],
    limit: 4,
  },
  CRAFT: {
    heading: "",
    body: "",
    imageUrl: "",
  },
  CTA: {
    title: "",
    ctaText: "Learn more",
    ctaHref: "",
  },
  RICH_TEXT: {
    content: "",
  },
  GALLERY: {
    images: [],
  },
  FAQ_LIST: {
    items: [],
  },
};

export const PAGE_BLOCK_TYPES: PageBlockType[] = [
  "HERO",
  "MANIFESTO",
  "FEATURED_PRODUCTS",
  "DUAL_NARRATIVE",
  "HIGH_JEWELRY",
  "CRAFT",
  "CTA",
  "RICH_TEXT",
  "GALLERY",
  "FAQ_LIST",
];
