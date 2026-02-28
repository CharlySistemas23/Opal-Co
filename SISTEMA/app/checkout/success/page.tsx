import { CheckoutSuccessContent } from "./CheckoutSuccessContent";

export const metadata = {
  title: "Order Confirmed",
  description: "Thank you for your purchase.",
};

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string | string[] };
}) {
  const raw = searchParams.session_id;
  const sessionId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;

  return <CheckoutSuccessContent sessionId={sessionId ?? null} />;
}
