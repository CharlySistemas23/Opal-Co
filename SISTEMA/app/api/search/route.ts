import { apiSuccess } from "@/lib/apiResponse";
import { searchProducts } from "@/lib/search/searchProducts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  try {
    const results = await searchProducts(q);
    return apiSuccess(results);
  } catch {
    return apiSuccess([]);
  }
}
