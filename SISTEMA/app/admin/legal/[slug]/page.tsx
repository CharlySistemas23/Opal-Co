"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Section, Heading, Text, Button } from "@/components/ui";

const inputClass = "w-full max-w-2xl px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

export default function AdminLegalEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/legal/${slug}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setTitle(data.data.title);
          setContent(data.data.content);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/legal/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content }),
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

  if (loading) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Text variant="body" muted>Loading…</Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="mb-8">
          <Link href="/admin/legal" className="font-sans text-sm uppercase tracking-wider text-charcoal/70 hover:text-charcoal">
            ← Legal
          </Link>
        </div>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Edit: {slug}
        </Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className={labelClass}>Title</label>
          <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label className={labelClass}>Content (HTML)</label>
          <textarea className={inputClass} rows={16} value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            {error && <Text variant="body" className="text-red-600">{error}</Text>}
          </div>
        </form>
      </Container>
    </Section>
  );
}
