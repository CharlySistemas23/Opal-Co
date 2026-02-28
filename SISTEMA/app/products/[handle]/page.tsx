import { Metadata } from "next";
import { safeEnv } from "@/utils/safeEnv";
import { Container } from "@/components/ui";
import { ProductGallery, ProductInfo } from "@/components/product";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { getProductForPublic, getProductForPublicWithFallback } from "@/lib/data/catalog";

const metadataBase = safeEnv("NEXT_PUBLIC_SITE_URL") || "https://opal-and-co.com";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

const PLACEHOLDER_MAP: Record<
  string,
  { title: string; material: string; price: string; description: string; images: Array<{ url: string; altText: string | null }>; variantId: string }
> = {
  "radiance-ring": {
    title: "Radiance Ring",
    material: "18K Yellow Gold, Diamonds",
    price: "12500",
    description: "A ring that catches light. For moments that deserve to be marked.",
    images: [
      { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80", altText: "Radiance Ring" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Radiance Ring detail" },
    ],
    variantId: "placeholder",
  },
  "luminance-necklace": {
    title: "Luminance Necklace",
    material: "Platinum, Sapphires",
    price: "18900",
    description: "Light captured. A piece that defines presence.",
    images: [
      { url: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80", altText: "Luminance Necklace" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Luminance Necklace detail" },
    ],
    variantId: "placeholder",
  },
  "serenity-earrings": {
    title: "Serenity Earrings",
    material: "18K White Gold, Pearls",
    price: "8900",
    description: "Understated elegance. For everyday refinement.",
    images: [
      { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80", altText: "Serenity Earrings" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Serenity Earrings detail" },
    ],
    variantId: "placeholder",
  },
  "essence-bracelet": {
    title: "Essence Bracelet",
    material: "Rose Gold, Diamonds",
    price: "14200",
    description: "A line that follows the wrist. Minimal. Essential.",
    images: [
      { url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&q=80", altText: "Essence Bracelet" },
      { url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80", altText: "Essence Bracelet detail" },
    ],
    variantId: "placeholder",
  },
};

const DEFAULT_PLACEHOLDER = PLACEHOLDER_MAP["radiance-ring"]!;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const productData = await getProductForPublic(handle);
  const placeholder = PLACEHOLDER_MAP[handle] ?? DEFAULT_PLACEHOLDER;
  const product = productData ?? {
    title: placeholder.title,
    description: placeholder.description,
    images: placeholder.images,
  };
  const imageUrl = product.images?.[0]?.url ?? "";
  return {
    title: product.title,
    description: product.description ?? undefined,
    openGraph: {
      title: product.title,
      description: product.description ?? undefined,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
      type: "website",
      url: `${metadataBase}/products/${handle}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const productData = await getProductForPublicWithFallback(handle);

  const product = {
    title: productData.title,
    material: productData.material,
    price: productData.price,
    currencyCode: productData.currencyCode,
    description: productData.description,
    images: productData.images,
    variantId: productData.variantId,
    byInquiry: productData.byInquiry,
  };

  const productUrl = `${metadataBase}/products/${handle}`;
  const mainImage = product.images[0]?.url ?? "";

  return (
    <div className="min-h-screen pt-20 pb-24 md:py-30">
      <ProductSchema
        name={product.title}
        description={product.description ?? product.title}
        image={mainImage}
        price={product.price}
        currency={product.currencyCode}
        url={productUrl}
      />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <ProductGallery images={product.images} title={product.title} />
          </div>
          <div>
            <ProductInfo
              title={product.title}
              material={product.material}
              price={product.price}
              currencyCode={product.currencyCode}
              description={product.description ?? undefined}
              variantId={product.variantId}
              byInquiry={product.byInquiry}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
