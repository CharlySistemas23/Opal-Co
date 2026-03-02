import Link from "next/link";
import { Container, Section, Heading, Text } from "@/components/ui";
import { getAllProductsForAdmin } from "@/lib/data/products";
import { databaseConfigured } from "@/utils/safeEnv";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = databaseConfigured() ? await getAllProductsForAdmin() : [];

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Products
          </Heading>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] bg-charcoal text-ivory hover:bg-charcoal/90 transition-all"
          >
            New product
          </Link>
        </div>

        {!databaseConfigured() ? (
          <Text variant="body" muted>
            Database not configured.
          </Text>
        ) : products.length === 0 ? (
          <Text variant="body" muted>
            No products yet. Create one to get started.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-charcoal/20">
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Handle
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Title
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Published
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">{p.handle}</td>
                    <td className="py-3 px-4">{p.title}</td>
                    <td className="py-3 px-4">{p.published ? "Yes" : "No"}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  );
}
