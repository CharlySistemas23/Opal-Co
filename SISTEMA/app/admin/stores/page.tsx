"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, Section, Heading, Text } from "@/components/ui";

interface Store {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stores", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setStores(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Stores
          </Heading>
          <Link
            href="/admin/stores/new"
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] bg-charcoal text-ivory hover:bg-charcoal/90 transition-all"
          >
            New store
          </Link>
        </div>

        {loading ? (
          <Text variant="body" muted>
            Loading…
          </Text>
        ) : stores.length === 0 ? (
          <Text variant="body" muted>
            No stores yet. Create one to get started.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-charcoal/20">
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Name
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    City
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Country
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id} className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4">{s.name}</td>
                    <td className="py-3 px-4">{s.city}</td>
                    <td className="py-3 px-4">{s.country}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/stores/${s.id}`}
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
