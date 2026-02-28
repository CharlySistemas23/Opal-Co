import Link from "next/link";
import { Container, Section, Heading, Text } from "@/components/ui";
import { getAllCollectionsForAdmin } from "@/lib/data/collections";
import { databaseConfigured } from "@/utils/safeEnv";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = databaseConfigured() ? await getAllCollectionsForAdmin() : [];

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Collections
          </Heading>
          <Link
            href="/admin/collections/new"
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] bg-charcoal text-ivory hover:bg-charcoal/90 transition-all"
          >
            New collection
          </Link>
        </div>

        {!databaseConfigured() ? (
          <Text variant="body" muted>
            Database not configured.
          </Text>
        ) : collections.length === 0 ? (
          <Text variant="body" muted>
            No collections yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-charcoal/20">
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Slug</th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Title</th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Published</th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => (
                  <tr key={c.id} className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">{c.slug}</td>
                    <td className="py-3 px-4">{c.title}</td>
                    <td className="py-3 px-4">{c.published ? "Yes" : "No"}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/collections/${c.id}`} className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline">
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
