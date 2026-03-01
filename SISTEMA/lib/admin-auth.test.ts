import { describe, it, expect } from "vitest";
import {
  generateOtpCode,
  hashToken,
  verifyOtpHash,
} from "@/lib/admin-auth";

describe("generateOtpCode", () => {
  it("returns a 6-digit string in range 100000-999999", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      const n = parseInt(code, 10);
      expect(n).toBeGreaterThanOrEqual(100000);
      expect(n).toBeLessThanOrEqual(999999);
    }
  });
});

describe("hashToken", () => {
  it("produces a 64-character hex string", () => {
    const hash = hashToken("123456");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toHaveLength(64);
  });

  it("produces deterministic output for same input", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });
});

describe("verifyOtpHash", () => {
  it("returns true when plain matches hash", () => {
    const plain = "123456";
    const hash = hashToken(plain);
    expect(verifyOtpHash(plain, hash)).toBe(true);
  });

  it("returns false when plain does not match hash", () => {
    const hash = hashToken("123456");
    expect(verifyOtpHash("wrong", hash)).toBe(false);
    expect(verifyOtpHash("123457", hash)).toBe(false);
  });

  it("returns false for tampered or invalid hash", () => {
    expect(verifyOtpHash("123456", "invalid")).toBe(false);
    expect(verifyOtpHash("123456", "")).toBe(false);
  });
});
