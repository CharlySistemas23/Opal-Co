import { createHmac } from "crypto";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { isCloudinaryConfigured, safeEnv } from "@/utils/safeEnv";

function generateSignature(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHmac("sha1", secret).update(sorted).digest("hex");
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  if (!isCloudinaryConfigured()) {
    return apiError("UNAVAILABLE", 503);
  }

  let body: { folder?: string } = {};
  try {
    body = await request.json().catch(() => ({}));
  } catch {
    // empty body ok
  }
  const folder = typeof body.folder === "string" && body.folder.trim()
    ? body.folder.trim()
    : "opal";

  const cloudName = safeEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = safeEnv("CLOUDINARY_API_KEY");
  const apiSecret = safeEnv("CLOUDINARY_API_SECRET");

  const timestamp = String(Math.floor(Date.now() / 1000));
  const paramsToSign: Record<string, string> = { timestamp };
  if (folder) paramsToSign.folder = folder;

  const signature = generateSignature(paramsToSign, apiSecret);

  return apiSuccess({
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  });
}
