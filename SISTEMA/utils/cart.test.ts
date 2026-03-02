import { describe, it, expect } from "vitest";
import { calculateCartSubtotal } from "./cart";

describe("calculateCartSubtotal", () => {
  it("returns 0 for empty array", () => {
    expect(calculateCartSubtotal([])).toBe(0);
  });

  it("calculates single item: price 100, quantity 2 → 200", () => {
    expect(
      calculateCartSubtotal([{ price: "100", quantity: 2 }])
    ).toBe(200);
  });

  it("calculates multiple items with decimals", () => {
    expect(
      calculateCartSubtotal([
        { price: "10.99", quantity: 2 },
        { price: "25.50", quantity: 1 },
      ])
    ).toBeCloseTo(47.48, 2);
  });

  it("handles zero price", () => {
    expect(calculateCartSubtotal([{ price: "0", quantity: 5 }])).toBe(0);
  });

  it("handles invalid price as 0", () => {
    expect(
      calculateCartSubtotal([{ price: "invalid", quantity: 2 }])
    ).toBe(0);
  });

  it("ignores negative quantity (floors to 0)", () => {
    expect(
      calculateCartSubtotal([{ price: "100", quantity: -1 }])
    ).toBe(0);
  });

  it("handles fractional quantity by flooring", () => {
    expect(
      calculateCartSubtotal([{ price: "10", quantity: 2.7 }])
    ).toBe(20);
  });
});
