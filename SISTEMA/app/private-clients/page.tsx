import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getPageBySlug } from "@/lib/data/pages";

export const metadata = {
  title: "Private Clients",
  description: "Bespoke commissions. Private viewing. Concierge service. A relationship built on discretion.",
};

export default async function PrivateClientsPage() {
  const page = await getPageBySlug("private-clients");
  const blocks = page?.blocks ?? [];

  if (blocks.length === 0) {
    return (
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-2xl font-serif text-charcoal mb-4">Private Clients</h1>
          <p className="text-charcoal/70">Content will appear here once configured in the admin.</p>
        </div>
      </section>
    );
  }

  return (
    <BlockRenderer
      blocks={blocks.map((b) => ({
        id: b.id,
        type: b.type,
        order: b.order,
        visible: b.visible,
        dataJson: b.dataJson,
      }))}
    />
  );
}
