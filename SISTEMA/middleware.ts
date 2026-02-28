import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookieEdge } from "@/lib/admin-auth-edge";

const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "dev-secret-change-in-production";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname === "/admin/forbidden") {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie");
  const session = await getSessionFromCookieEdge(cookieHeader, ADMIN_SESSION_SECRET);

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin/users")) {
    if (session.role !== "OWNER" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/forbidden", request.url));
    }
  }

  if (pathname.startsWith("/admin/subscribers")) {
    if (
      session.role !== "OWNER" &&
      session.role !== "ADMIN" &&
      session.role !== "MANAGER"
    ) {
      return NextResponse.redirect(new URL("/admin/forbidden", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/((?!login|forbidden).*)"],
};
