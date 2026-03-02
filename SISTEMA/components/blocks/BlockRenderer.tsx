import type { PageBlockType } from "@/lib/blocks/types";

const WIDTH_CLASSES: Record<string, string> = {
  full: "w-full",
  wide: "w-full max-w-6xl mx-auto",
  narrow: "w-full max-w-3xl mx-auto",
};

function BlockWrapper({
  data,
  children,
}: {
  data: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const width = (data.width as string) || "full";
  const widthClass = WIDTH_CLASSES[width] ?? WIDTH_CLASSES.full;
  return <div className={widthClass}>{children}</div>;
}

export interface BlockRendererBlock {
  id: string;
  type: PageBlockType;
  order: number;
  visible: boolean;
  dataJson: unknown;
}
import type { HeroBlockData, ManifestoBlockData, DualNarrativeBlockData, CraftBlockData, CtaBlockData, RichTextBlockData, FaqListBlockData } from "@/lib/blocks/types";
import { HeroBlock } from "./HeroBlock";
import { ManifestoBlock as BlockManifesto } from "./ManifestoBlock";
import { DualNarrativeBlock } from "./DualNarrativeBlock";
import { CraftBlock } from "./CraftBlock";
import { CtaBlock } from "./CtaBlock";
import { RichTextBlock } from "./RichTextBlock";
import { FaqListBlock } from "./FaqListBlock";
import { FeaturedProductsBlock } from "./FeaturedProductsBlock";
import { HighJewelryBlock } from "./HighJewelryBlock";
import { GalleryBlock } from "./GalleryBlock";

export interface GridProduct {
  id: string;
  handle: string;
  title: string;
  material?: string;
  image?: string;
}

interface BlockRendererProps {
  blocks: BlockRendererBlock[];
  products?: GridProduct[];
  highJewelryPieces?: GridProduct[];
}

export function BlockRenderer({
  blocks,
  products = [],
  highJewelryPieces = [],
}: BlockRendererProps) {
  const visibleBlocks = blocks.filter((b) => b.visible).sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleBlocks.map((block) => {
        const data = (block.dataJson ?? {}) as Record<string, unknown>;
        const wrapLayout = (node: React.ReactNode) =>
          ["HERO", "CRAFT", "CTA", "RICH_TEXT"].includes(block.type)
            ? <BlockWrapper data={data}>{node}</BlockWrapper>
            : node;
        switch (block.type) {
          case "HERO":
            return <div key={block.id}>{wrapLayout(<HeroBlock data={data as unknown as HeroBlockData} />)}</div>;
          case "MANIFESTO":
            return <div key={block.id}><BlockManifesto data={data as unknown as ManifestoBlockData} /></div>;
          case "DUAL_NARRATIVE":
            return <div key={block.id}><DualNarrativeBlock data={data as unknown as DualNarrativeBlockData} /></div>;
          case "CRAFT":
            return <div key={block.id}>{wrapLayout(<CraftBlock data={data as unknown as CraftBlockData} />)}</div>;
          case "CTA":
            return <div key={block.id}>{wrapLayout(<CtaBlock data={data as unknown as CtaBlockData} />)}</div>;
          case "RICH_TEXT":
            return <div key={block.id}>{wrapLayout(<RichTextBlock data={data as unknown as RichTextBlockData} />)}</div>;
          case "FAQ_LIST":
            return <div key={block.id}><FaqListBlock data={data as unknown as FaqListBlockData} /></div>;
          case "FEATURED_PRODUCTS":
            return <div key={block.id}><FeaturedProductsBlock data={data} products={products} /></div>;
          case "HIGH_JEWELRY":
            return <div key={block.id}><HighJewelryBlock data={data} pieces={highJewelryPieces} /></div>;
          case "GALLERY":
            return <div key={block.id}><GalleryBlock data={data} /></div>;
          default:
            return null;
        }
      })}
    </>
  );
}
