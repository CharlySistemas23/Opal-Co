"use client";

import { useRouter } from "next/navigation";
import { Heading } from "@/components/ui";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { VariantEditor } from "@/components/admin/products/VariantEditor";
import { ProductMediaManager } from "@/components/admin/products/ProductMediaManager";
import Link from "next/link";

interface ProductEditClientProps {
  product: {
    id: string;
    handle: string;
    title: string;
    description: string | null;
    materialSummary: string | null;
    gemstoneSummary: string | null;
    byInquiry: boolean;
    published: boolean;
    images: Array<{
      id: string;
      mediaAssetId: string;
      mediaAsset: { url: string; alt: string | null } | null;
      order: number;
    }>;
    variants: Array<{
      id: string;
      sku: string;
      title: string;
      priceCents: number;
      currency: string;
      active: boolean;
    }>;
  };
}

export function ProductEditClient({ product }: ProductEditClientProps) {
  const router = useRouter();

  const images = product.images.map((img) => ({
    id: img.id,
    mediaAssetId: img.mediaAssetId,
    url: img.mediaAsset?.url ?? "",
    alt: img.mediaAsset?.alt ?? null,
    order: img.order,
  }));

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-charcoal/70 hover:text-charcoal text-sm">
          ← Products
        </Link>
        <Heading as="h1" level={2} className="text-charcoal">
          Edit: {product.title}
        </Heading>
      </div>

      <div className="border border-charcoal/20 rounded-lg p-6 bg-ivory">
        <Heading as="h2" level={4} className="text-charcoal mb-4">
          Product details
        </Heading>
        <ProductForm product={product} onSaved={() => router.refresh()} />
      </div>

      <div className="border border-charcoal/20 rounded-lg p-6 bg-ivory">
        <Heading as="h2" level={4} className="text-charcoal mb-4">
          Variants
        </Heading>
        <VariantEditor
          productId={product.id}
          variants={product.variants}
          onSaved={() => router.refresh()}
        />
      </div>

      <div className="border border-charcoal/20 rounded-lg p-6 bg-ivory">
        <Heading as="h2" level={4} className="text-charcoal mb-4">
          Images
        </Heading>
        <ProductMediaManager
          productId={product.id}
          images={images}
          onSaved={() => router.refresh()}
        />
      </div>
    </div>
  );
}
