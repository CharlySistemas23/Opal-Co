import { isPostmarkConfigured, isResendConfigured, safeEnv } from "@/utils/safeEnv";

const FROM_EMAIL = safeEnv("ADMIN_EMAIL_FROM") || "admin@opal-and-co.com";
const FROM_NAME = safeEnv("ADMIN_EMAIL_FROM_NAME") || "OPAL & CO Admin";

export async function sendOtpEmail(to: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const subject = "Your admin login code";
  const text = `Your one-time login code is: ${code}. It expires in 10 minutes.`;

  if (isResendConfigured()) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${safeEnv("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [to],
          subject,
          text,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { ok: false, error: err || "RESEND_FAILED" };
      }
      return { ok: true };
    } catch (e) {
      console.error("[sendOtpEmail] Resend error:", e);
      return { ok: false, error: "EMAIL_FAILED" };
    }
  }

  if (isPostmarkConfigured()) {
    try {
      const res = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": safeEnv("POSTMARK_SERVER_TOKEN"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          From: `${FROM_NAME} <${FROM_EMAIL}>`,
          To: to,
          Subject: subject,
          TextBody: text,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { ok: false, error: err || "POSTMARK_FAILED" };
      }
      return { ok: true };
    } catch (e) {
      console.error("[sendOtpEmail] Postmark error:", e);
      return { ok: false, error: "EMAIL_FAILED" };
    }
  }

  console.log("[sendOtpEmail] No email configured. OTP for", to, ":", code);
  return { ok: true };
}
