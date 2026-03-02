"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heading, Button, Text } from "@/components/ui";
import { CollectionForm } from "@/components/admin/collections/CollectionForm";
import { ProductPicker } from "@/components/admin/collections/ProductPicker";

interface CollectionEditClientProps {
  collection: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    published: boolean;
    productCollections: Array<{
      productId: string;
      product: { id: string; handle: string; title: string };
    }>;
  };
}

export function CollectionEditClient({ collection }: CollectionEditClientProps) {
  const router = useRouter();
  const [productIds, setProductIds] = useState<string[]>(
    collection.productCollections.map((pc) => pc.productId)
  );
  const [savingProducts, setSavingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  async function handleSaveProducts() {
    setSavingProducts(true);
    setProductsError(null);
    try {
      const res = await fetch(`/api/admin/collections/${collection.id}/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setProductsError(data?.error ?? "Failed to save");
        return;
      }
      router.refresh();
    } catch {
      setProductsError("Network error");
    } finally {
      setSavingProducts(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/collections" className="text-charcoal/70 hover:text-charcoal text-sm">
          ← Collections
        </Link>
        <Heading as="h1" level={2} className="text-charcoal">
          Edit: {collection.title}
        </Heading>
      </div>

      <div className="border border-charcoal/20 rounded-lg p-6 bg-ivory">
        <Heading as="h2" level={4} className="text-charcoal mb-4">
          Collection details
        </Heading>
        <CollectionForm collection={collection} onSaved={() => router.refresh()} />
      </div>

      <div className="border border-charcoal/20 rounded-lg p-6 bg-ivory">
        <Heading as="h2" level={4} className="text-charcoal mb-4">
          Products
        </Heading>
        <ProductPicker selectedIds={productIds} onChange={setProductIds} />
        <div className="mt-4">
          <Button type="button" onClick={handleSaveProducts} disabled={savingProducts}>
            {savingProducts ? "Saving…" : "Save products"}
          </Button>
        </div>
        {productsError && (
          <Text variant="body" className="text-red-600 mt-2">
            {productsError}
          </Text>
        )}
      </div>
    </div>
  );
}
