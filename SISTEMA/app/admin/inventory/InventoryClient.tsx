"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StockTable } from "@/components/admin/inventory/StockTable";
import { AdjustModal } from "@/components/admin/inventory/AdjustModal";
import { TransferModal } from "@/components/admin/inventory/TransferModal";
import { MovementHistory } from "@/components/admin/inventory/MovementHistory";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface StockLevel {
  id: string;
  branchId: string;
  variantId: string;
  quantity: number;
  branch: Branch;
  variant: {
    id: string;
    sku: string;
    product: { handle: string; title: string };
  };
}

interface InventoryClientProps {
  branches: Branch[];
  stockLevels: StockLevel[];
}

export function InventoryClient({ branches, stockLevels }: InventoryClientProps) {
  const router = useRouter();
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<StockLevel | null>(null);
  const [historyVariantId, setHistoryVariantId] = useState<string | null>(null);

  const filtered = branchFilter
    ? stockLevels.filter((s) => s.branchId === branchFilter)
    : stockLevels;

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="px-3 py-2 border border-charcoal/20 rounded text-sm"
        >
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.code})
            </option>
          ))}
        </select>
      </div>

      <StockTable
        stockLevels={filtered}
        onAdjust={(row) => {
          setSelectedRow(row);
          setAdjustOpen(true);
        }}
        onTransfer={(row) => {
          setSelectedRow(row);
          setTransferOpen(true);
        }}
        onViewHistory={(variantId) => setHistoryVariantId(variantId)}
      />

      {adjustOpen && selectedRow && (
        <AdjustModal
          branch={selectedRow.branch}
          variant={selectedRow.variant}
          onClose={() => {
            setAdjustOpen(false);
            setSelectedRow(null);
            refresh();
          }}
        />
      )}

      {transferOpen && selectedRow && (
        <TransferModal
          branches={branches}
          variant={selectedRow.variant}
          fromBranchId={selectedRow.branchId}
          onClose={() => {
            setTransferOpen(false);
            setSelectedRow(null);
            refresh();
          }}
        />
      )}

      {historyVariantId && (
        <MovementHistory
          variantId={historyVariantId}
          onClose={() => setHistoryVariantId(null)}
        />
      )}
    </div>
  );
}
