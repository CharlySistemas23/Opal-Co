import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { safeEnv } from "@/utils/safeEnv";

export const SESSION_COOKIE_NAME = "opal_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const SESSION_SECRET = safeEnv("ADMIN_SESSION_SECRET") || "dev-secret-change-in-production";
const OTP_PEPPER = safeEnv("ADMIN_OTP_PEPPER") || "dev-otp-pepper";

export type StaffRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";

export const STAFF_ROLES: StaffRole[] = ["OWNER", "ADMIN", "MANAGER", "STAFF", "VIEWER"];

export interface AdminSession {
  userId: string;
  role: StaffRole;
  sessionId?: string;
  email?: string;
}

export function getMockOwnerEmail(): string {
  const email = safeEnv("ADMIN_OWNER_EMAIL").trim().toLowerCase();
  return email || "owner@local.dev";
}

export function canAccessUsers(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canAccessCatalog(role: string): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER" || role === "STAFF";
}

export function canAccessSubscribers(role: string): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MANAGER";
}

export function generateOtpCode(): string {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return String(n);
}

export function hashToken(token: string): string {
  return createHmac("sha256", OTP_PEPPER).update(token).digest("hex");
}

export function verifyOtpHash(plain: string, hash: string): boolean {
  const computed = hashToken(plain);
  if (computed.length !== hash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function getSigningKey(): Buffer {
  return Buffer.from(SESSION_SECRET, "utf8");
}

export function createSignedPayload(payload: AdminSession): string {
  const data = JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });
  const b64 = Buffer.from(data, "utf8").toString("base64url");
  const sig = createHmac("sha256", getSigningKey()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function getSessionFromCookie(cookieHeader: string | null): AdminSession | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v?.trim() ?? ""];
    })
  );
  const raw = cookies[SESSION_COOKIE_NAME];
  if (!raw) return null;
  const [b64, sig] = raw.split(".");
  if (!b64 || !sig) return null;
  const expectedSig = createHmac("sha256", getSigningKey()).update(b64).digest("base64url");
  if (expectedSig.length !== sig.length || !timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
    return null;
  }
  let data: { userId: string; role: StaffRole; exp: number; sessionId?: string };
  try {
    data = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
  return {
    userId: data.userId,
    role: data.role,
    sessionId: data.sessionId,
  };
}
