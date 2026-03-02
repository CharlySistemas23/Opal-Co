import { createHmac } from "crypto";
import { safeEnv } from "@/utils/safeEnv";

/**
 * Generates Cloudinary signed upload params for client-side upload.
 * Client uploads directly to Cloudinary with these params.
 * @see https://cloudinary.com/documentation/authentication_signatures
 */
export function getSignedUploadParams(folder: string = "opal"): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const cloudName = safeEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = safeEnv("CLOUDINARY_API_KEY");
  const apiSecret = safeEnv("CLOUDINARY_API_SECRET");

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };
  const sorted = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join("&");
  const stringToSign = sorted + apiSecret;
  const signature = createHmac("sha1", apiSecret)
    .update(stringToSign)
    .digest("hex");

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
  };
}
