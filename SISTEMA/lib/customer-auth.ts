import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { safeEnv } from "@/utils/safeEnv";

export const CUSTOMER_SESSION_COOKIE_NAME = "opal_customer_session";
export const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const CUSTOMER_SESSION_SECRET =
  safeEnv("CUSTOMER_SESSION_SECRET") || "dev-customer-secret";

export interface CustomerSession {
  customerId: string;
  email: string;
}

export function hashCustomerToken(token: string): string {
  return createHmac("sha256", CUSTOMER_SESSION_SECRET)
    .update(token)
    .digest("hex");
}

export function createCustomerSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function getSigningKey(): Buffer {
  return Buffer.from(CUSTOMER_SESSION_SECRET, "utf8");
}

export function createCustomerSignedPayload(
  payload: CustomerSession & { exp?: number }
): string {
  const data = JSON.stringify({
    ...payload,
    exp:
      payload.exp ??
      Math.floor(Date.now() / 1000) + CUSTOMER_SESSION_MAX_AGE_SECONDS,
  });
  const b64 = Buffer.from(data, "utf8").toString("base64url");
  const sig = createHmac("sha256", getSigningKey())
    .update(b64)
    .digest("base64url");
  return `${b64}.${sig}`;
}

export function getCustomerSessionFromCookie(
  cookieHeader: string | null
): CustomerSession | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, v] = c.trim().split("=");
      return [k, v?.trim() ?? ""];
    })
  );
  const raw = cookies[CUSTOMER_SESSION_COOKIE_NAME];
  if (!raw) return null;
  const [b64, sig] = raw.split(".");
  if (!b64 || !sig) return null;
  const expectedSig = createHmac("sha256", getSigningKey())
    .update(b64)
    .digest("base64url");
  if (
    expectedSig.length !== sig.length ||
    !timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))
  ) {
    return null;
  }
  let data: { customerId: string; email: string; exp?: number };
  try {
    data = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
  return {
    customerId: data.customerId,
    email: data.email,
  };
}
