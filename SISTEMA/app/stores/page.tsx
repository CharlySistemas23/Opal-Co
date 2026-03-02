import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";
import { getStores } from "@/lib/data/stores";

export const metadata = {
  title: "Stores",
  description: "Find OPAL & CO. By appointment only.",
};

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="min-h-screen py-20 md:py-30">
      <section className="py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            Stores
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto">
            Visit us by appointment. We look forward to welcoming you.
          </Text>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container>
          {stores.length === 0 ? (
            <p className="text-charcoal/70 text-center">No stores configured yet. Add them in the admin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="block p-8 border border-charcoal/10 hover:border-charcoal/20 transition-colors"
                >
                  <Heading as="h2" level={4} className="text-charcoal mb-4">
                    {store.name}
                  </Heading>
                  <Text variant="body" muted>
                    {store.address}
                  </Text>
                  <Text variant="small" muted className="mt-2">
                    {store.city}, {store.country}
                  </Text>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
