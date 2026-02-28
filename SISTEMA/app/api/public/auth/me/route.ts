import { getCustomerSessionFromCookie } from "@/lib/customer-auth";
import { apiSuccess } from "@/lib/apiResponse";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const session = getCustomerSessionFromCookie(cookieHeader);
  if (!session) {
    return apiSuccess({ customer: null });
  }
  return apiSuccess({
    customer: { id: session.customerId, email: session.email },
  });
}
