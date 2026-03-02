import { apiError, apiSuccess } from "@/lib/apiResponse";
import { sendWithTemplate } from "@/lib/email/provider";
import { isPostmarkConfigured, isResendConfigured } from "@/utils/safeEnv";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }

    if (isPostmarkConfigured() || isResendConfigured()) {
      await sendWithTemplate({
        to: email,
        template: "inquiry_received",
        variables: { name: name || "there" },
      }).catch((e) => console.error("[contact] Email failed:", e));
    } else {
      console.log("[Contact form]", { name, email, message });
    }

    return apiSuccess({ ok: true });
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
