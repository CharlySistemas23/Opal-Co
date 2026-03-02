"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Section, Heading, Text, Button } from "@/components/ui";

const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

export default function AdminStoresNewPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          slug: slug || undefined,
          name,
          address,
          city,
          country,
          mapUrl: mapUrl || undefined,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to create");
        return;
      }
      router.push("/admin/stores");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          New store
        </Heading>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <label className={labelClass}>Name</label>
          <input type="text" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          <label className={labelClass}>Slug</label>
          <input type="text" className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. new-york" />
          <label className={labelClass}>Address</label>
          <input type="text" className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
          <label className={labelClass}>City</label>
          <input type="text" className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
          <label className={labelClass}>Country</label>
          <input type="text" className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} />
          <label className={labelClass}>Map URL</label>
          <input type="url" className={inputClass} value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://..." />
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create"}</Button>
            {error && <Text variant="body" className="text-red-600">{error}</Text>}
          </div>
        </form>
      </Container>
    </Section>
  );
}
