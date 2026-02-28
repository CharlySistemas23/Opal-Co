/**
 * Edge-safe session cookie verification (Web Crypto only).
 * Use in middleware; for full auth use lib/admin-auth.ts on the server.
 */

const SESSION_COOKIE_NAME = "opal_admin_session";

function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function signPayload(b64: string, secret: string): Promise<string> {
  const key = await getSigningKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(b64)
  );
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sig))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export interface EdgeSession {
  userId: string;
  role: string;
  sessionId?: string;
}

export async function getSessionFromCookieEdge(
  cookieHeader: string | null,
  secret: string
): Promise<EdgeSession | null> {
  if (!cookieHeader || !secret) return null;
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
  const expectedSig = await signPayload(b64, secret);
  if (expectedSig.length !== sig.length) return null;
  for (let i = 0; i < expectedSig.length; i++) {
    if (expectedSig[i] !== sig[i]) return null;
  }
  let data: { userId: string; role: string; sessionId?: string; exp: number };
  try {
    data = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
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
