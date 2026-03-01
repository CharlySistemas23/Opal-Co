"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/ui";

interface MovementHistoryProps {
  variantId: string;
  onClose: () => void;
}

interface Movement {
  id: string;
  type: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  branch: { name: string };
}

export function MovementHistory({ variantId, onClose }: MovementHistoryProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovements() {
      try {
        const res = await fetch(`/api/admin/inventory/movements?variantId=${variantId}&limit=30`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.movements)) {
          setMovements(data.movements);
        }
      } catch {
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMovements();
  }, [variantId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50" onClick={onClose}>
      <div className="bg-ivory rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto m-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium text-charcoal mb-4">Movement history</h3>
        {loading ? (
          <Text variant="body" muted>Loading…</Text>
        ) : movements.length === 0 ? (
          <Text variant="body" muted>No movements.</Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/20">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Branch</th>
                  <th className="py-2 px-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-charcoal/10">
                    <td className="py-2 px-3">{new Date(m.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-3">{m.type}</td>
                    <td className="py-2 px-3">{m.quantity}</td>
                    <td className="py-2 px-3">{m.branch?.name ?? "-"}</td>
                    <td className="py-2 px-3">{m.note ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button type="button" onClick={onClose} className="mt-4 px-4 py-2 border border-charcoal/20 rounded">
          Close
        </button>
      </div>
    </div>
  );
}
