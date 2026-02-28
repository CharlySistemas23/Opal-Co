import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Stub: no real auth. Replace with real sign-in (e.g. NextAuth, Shopify Customer API).
    console.log("[Sign in]", body);
    return apiSuccess({ success: true });
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
