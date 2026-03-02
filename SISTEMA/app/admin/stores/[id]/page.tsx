"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Container, Section, Heading, Text, Button } from "@/components/ui";

const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

interface Store {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  country: string;
  mapUrl: string | null;
  description: string | null;
  order: number;
}

export default function AdminStoreEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [store, setStore] = useState<Store | null>(null);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/stores/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const s = data.data as Store;
          setStore(s);
          setSlug(s.slug);
          setName(s.name);
          setAddress(s.address);
          setCity(s.city);
          setCountry(s.country);
          setMapUrl(s.mapUrl ?? "");
          setDescription(s.description ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug,
          name,
          address,
          city,
          country,
          mapUrl: mapUrl || null,
          description: description || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to save");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !store) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Text variant="body" muted>{loading ? "Loading…" : "Store not found."}</Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/stores" className="font-sans text-sm uppercase tracking-wider text-charcoal/70 hover:text-charcoal">
            ← Stores
          </Link>
        </div>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Edit store: {store.name}
        </Heading>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <label className={labelClass}>Name</label>
          <input type="text" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          <label className={labelClass}>Slug</label>
          <input type="text" className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
          <label className={labelClass}>Address</label>
          <input type="text" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
          <label className={labelClass}>City</label>
          <input type="text" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
          <label className={labelClass}>Country</label>
          <input type="text" className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} />
          <label className={labelClass}>Map URL</label>
          <input type="url" className={inputClass} value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} />
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            {error && <Text variant="body" className="text-red-600">{error}</Text>}
          </div>
        </form>
      </Container>
    </Section>
  );
}
