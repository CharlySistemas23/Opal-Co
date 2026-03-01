import { createHmac, timingSafeEqual } from "crypto";
import { safeEnv } from "@/utils/safeEnv";

const SUBSCRIBER_VERIFY_PEPPER =
  safeEnv("SUBSCRIBER_VERIFY_PEPPER") || "dev-subscriber-verify-pepper";

export function hashSubscriberToken(token: string): string {
  return createHmac("sha256", SUBSCRIBER_VERIFY_PEPPER)
    .update(token)
    .digest("hex");
}

export function verifySubscriberToken(plain: string, hash: string): boolean {
  const computed = hashSubscriberToken(plain);
  if (computed.length !== hash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}
