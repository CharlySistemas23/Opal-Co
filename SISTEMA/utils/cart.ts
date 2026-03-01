/**
 * Calculate cart subtotal from line items.
 * Handles invalid/empty prices as 0.
 */
export function calculateCartSubtotal(
  lines: { price: string; quantity: number }[]
): number {
  return lines.reduce((sum, line) => {
    const price = parseFloat(line.price);
    const qty = Math.max(0, Math.floor(line.quantity));
    return sum + (Number.isNaN(price) ? 0 : price) * qty;
  }, 0);
}
