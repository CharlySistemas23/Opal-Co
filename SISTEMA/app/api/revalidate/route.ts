import { revalidateTag, revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? "";

function getToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  return null;
}

export async function POST(request: Request) {
  if (!REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: "Revalidation not configured" },
      { status: 503 }
    );
  }

  let body: { secret?: string; tag?: string; path?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  let token: string | null = getToken(request);
  if (!token && body?.secret && typeof body.secret === "string") {
    token = body.secret.trim() || null;
  }

  if (!token || token !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tag, path } = body;
  if (!tag && !path) {
    return NextResponse.json(
      { error: "Provide tag or path" },
      { status: 400 }
    );
  }

  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path);

  return NextResponse.json({ revalidated: true });
}
