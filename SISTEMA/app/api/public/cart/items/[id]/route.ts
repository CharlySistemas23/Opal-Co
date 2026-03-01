import { apiError, apiSuccess } from "@/lib/apiResponse";
import { updateCartItemQuantity, removeCartItem } from "@/lib/data/cart";
import { databaseConfigured } from "@/utils/safeEnv";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!databaseConfigured()) {
    return apiError("UNAVAILABLE", 503);
  }
  const { id } = await params;
  if (!id) return apiError("INVALID_ID", 400);
  let body: { quantity?: number } = {};
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }
  const quantity = typeof body.quantity === "number" ? body.quantity : 1;
  const result = await updateCartItemQuantity(id, quantity);
  if (result.error) {
    if (result.error === "NOT_FOUND") return apiError(result.error, 404);
    return apiError(result.error, 500);
  }
  return apiSuccess({ cart: result.cart });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!databaseConfigured()) {
    return apiError("UNAVAILABLE", 503);
  }
  const { id } = await params;
  if (!id) return apiError("INVALID_ID", 400);
  const result = await removeCartItem(id);
  if (result.error) {
    if (result.error === "NOT_FOUND") return apiError(result.error, 404);
    return apiError(result.error, 500);
  }
  return apiSuccess({ cart: result.cart });
}
