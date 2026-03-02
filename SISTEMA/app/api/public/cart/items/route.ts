import { apiError, apiSuccess } from "@/lib/apiResponse";
import { addCartItem } from "@/lib/data/cart";
import { databaseConfigured } from "@/utils/safeEnv";

export async function POST(request: Request) {
  if (!databaseConfigured()) {
    return apiError("UNAVAILABLE", 503);
  }
  let body: { cartId?: string; variantId?: string; quantity?: number } = {};
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }
  const cartId = typeof body.cartId === "string" ? body.cartId.trim() : "";
  const variantId = typeof body.variantId === "string" ? body.variantId.trim() : "";
  const quantity = typeof body.quantity === "number" ? body.quantity : 1;
  if (!cartId || !variantId) {
    return apiError("INVALID_BODY", 400);
  }
  const result = await addCartItem(cartId, variantId, quantity);
  if (result.error) {
    if (result.error === "CART_NOT_FOUND" || result.error === "VARIANT_NOT_FOUND") {
      return apiError(result.error, 404);
    }
    if (result.error === "INVALID_QUANTITY") {
      return apiError(result.error, 400);
    }
    return apiError(result.error, 500);
  }
  return apiSuccess({ cart: result.cart });
}
