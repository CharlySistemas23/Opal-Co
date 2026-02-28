import { MetadataRoute } from "next";
import { safeEnv } from "@/utils/safeEnv";

const baseUrl = safeEnv("NEXT_PUBLIC_SITE_URL") || "https://opal-and-co.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
