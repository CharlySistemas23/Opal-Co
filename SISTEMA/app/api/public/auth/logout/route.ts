import { apiSuccess } from "@/lib/apiResponse";
import { CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customer-auth";

export async function POST() {
  const res = apiSuccess({ ok: true });
  res.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
