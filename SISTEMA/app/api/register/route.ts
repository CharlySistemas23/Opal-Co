import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Stub: log payload server-side. Replace with real user registration.
    console.log("[Register]", body);
    return apiSuccess({ ok: true });
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
