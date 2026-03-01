"use client";

import { Text } from "@/components/ui";

interface StockLevel {
  id: string;
  branchId: string;
  variantId: string;
  quantity: number;
  branch: { id: string; name: string; code: string };
  variant: {
    id: string;
    sku: string;
    product: { handle: string; title: string };
  };
}

interface StockTableProps {
  stockLevels: StockLevel[];
  onAdjust: (row: StockLevel) => void;
  onTransfer: (row: StockLevel) => void;
  onViewHistory: (variantId: string) => void;
}

export function StockTable(props: StockTableProps) {
  const { stockLevels, onAdjust, onTransfer, onViewHistory } = props;

  if (stockLevels.length === 0) {
    return <Text variant="body" muted>No stock levels.</Text>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-charcoal/20">
            <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">SKU</th>
            <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Product</th>
            <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Branch</th>
            <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Quantity</th>
            <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stockLevels.map((row) => (
            <tr key={row.id} className="border-b border-charcoal/10 hover:bg-charcoal/5">
              <td className="py-3 px-4 font-mono text-sm">{row.variant.sku}</td>
              <td className="py-3 px-4">{row.variant.product.title}</td>
              <td className="py-3 px-4">{row.branch.name}</td>
              <td className="py-3 px-4">{row.quantity}</td>
              <td className="py-3 px-4 flex gap-2">
                <button type="button" onClick={() => onAdjust(row)} className="text-xs px-2 py-1 border border-charcoal/20 rounded hover:bg-charcoal/5">Adjust</button>
                <button type="button" onClick={() => onTransfer(row)} className="text-xs px-2 py-1 border border-charcoal/20 rounded hover:bg-charcoal/5">Transfer</button>
                <button type="button" onClick={() => onViewHistory(row.variantId)} className="text-xs px-2 py-1 text-charcoal/70 hover:underline">History</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
