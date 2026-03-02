const REQUEST_CODE_WINDOW_MS = 15 * 60 * 1000;
const REQUEST_CODE_MAX = 5;
const VERIFY_CODE_WINDOW_MS = 15 * 60 * 1000;
const VERIFY_CODE_MAX = 10;

type Entry = { count: number; resetAt: number };

const requestCodeMap = new Map<string, Entry>();
const verifyCodeMap = new Map<string, Entry>();

function checkAndIncrement(
  map: Map<string, Entry>,
  key: string,
  windowMs: number,
  max: number
): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export function checkRequestCode(email: string): boolean {
  const key = `request:${email.toLowerCase()}`;
  return checkAndIncrement(
    requestCodeMap,
    key,
    REQUEST_CODE_WINDOW_MS,
    REQUEST_CODE_MAX
  );
}

export function checkVerifyCode(email: string): boolean {
  const key = `verify:${email.toLowerCase()}`;
  return checkAndIncrement(
    verifyCodeMap,
    key,
    VERIFY_CODE_WINDOW_MS,
    VERIFY_CODE_MAX
  );
}
