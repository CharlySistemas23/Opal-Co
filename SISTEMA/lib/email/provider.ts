import { isPostmarkConfigured, isResendConfigured, safeEnv } from "@/utils/safeEnv";

const FROM_EMAIL = safeEnv("ADMIN_EMAIL_FROM") || "admin@opal-and-co.com";
const FROM_NAME = safeEnv("ADMIN_EMAIL_FROM_NAME") || "OPAL & CO Admin";

export interface SendTemplateParams {
  to: string;
  template: string;
  variables: Record<string, string | number>;
}

export async function sendWithTemplate(
  params: SendTemplateParams
): Promise<{ ok: boolean; error?: string }> {
  const { to, template, variables } = params;

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
          template: {
            id: template,
            variables: Object.fromEntries(
              Object.entries(variables).map(([k, v]) => [k, String(v)])
            ),
          },
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[email/provider] Resend template error:", err);
        return { ok: false, error: err || "RESEND_FAILED" };
      }
      return { ok: true };
    } catch (e) {
      console.error("[email/provider] Resend error:", e);
      return { ok: false, error: "EMAIL_FAILED" };
    }
  }

  if (isPostmarkConfigured()) {
    try {
      const res = await fetch("https://api.postmarkapp.com/email/withTemplate", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": safeEnv("POSTMARK_SERVER_TOKEN"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          From: `${FROM_NAME} <${FROM_EMAIL}>`,
          To: to,
          TemplateAlias: template,
          TemplateModel: Object.fromEntries(
            Object.entries(variables).map(([k, v]) => [k, String(v)])
          ),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[email/provider] Postmark template error:", err);
        return { ok: false, error: err || "POSTMARK_FAILED" };
      }
      return { ok: true };
    } catch (e) {
      console.error("[email/provider] Postmark error:", e);
      return { ok: false, error: "EMAIL_FAILED" };
    }
  }

  console.log("[email/provider] No email configured. Template:", template, "to:", to);
  return { ok: false, error: "EMAIL_NOT_CONFIGURED" };
}
