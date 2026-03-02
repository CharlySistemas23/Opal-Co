import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCartById, createCart } from "@/lib/data/cart";
import { databaseConfigured } from "@/utils/safeEnv";

export async function GET(request: Request) {
  if (!databaseConfigured()) return apiError("UNAVAILABLE", 503);
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");
  if (!cartId || typeof cartId !== "string") return apiError("INVALID_CART_ID", 400);
  const cart = await getCartById(cartId);
  if (!cart) return apiError("NOT_FOUND", 404);
  return apiSuccess({ cart });
}

export async function POST(request: Request) {
  if (!databaseConfigured()) return apiError("UNAVAILABLE", 503);
  let body: { customerId?: string } = {};
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }
  const customerId =
    typeof body.customerId === "string" && body.customerId.trim()
      ? body.customerId.trim()
      : undefined;
  const cart = await createCart(customerId);
  if (!cart) return apiError("FAILED", 500);
  return apiSuccess({ cart });
}
