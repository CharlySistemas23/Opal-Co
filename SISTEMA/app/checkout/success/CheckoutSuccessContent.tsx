"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, Heading, Text, Button } from "@/components/ui";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface CheckoutSuccessContentProps {
  sessionId: string | null;
}

export function CheckoutSuccessContent({ sessionId }: CheckoutSuccessContentProps) {
  const { customer } = useCustomerAuth();
  const [confirmation, setConfirmation] = useState<{
    orderNumber: string;
    email: string;
  } | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setFetched(true);
      return;
    }
    fetch(
      `/api/public/orders/confirmation?session_id=${encodeURIComponent(sessionId)}`,
      { credentials: "include" }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orderNumber && data?.email) {
          setConfirmation({ orderNumber: data.orderNumber, email: data.email });
        }
        setFetched(true);
      })
      .catch(() => setFetched(true));
  }, [sessionId]);

  return (
    <div className="min-h-screen py-20 md:py-30 flex items-center">
      <Container className="max-w-xl mx-auto text-center">
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Thank You
        </Heading>
        <Text variant="large" className="text-charcoal/90 mb-6">
          Your order has been received and is being prepared with care.
        </Text>
        {confirmation ? (
          <Text variant="body" muted className="mb-4">
            Order number: <strong>{confirmation.orderNumber}</strong>
            <br />
            Confirmation sent to: <strong>{confirmation.email}</strong>
          </Text>
        ) : fetched ? (
          <Text variant="body" muted className="mb-4">
            We will send a confirmation with tracking details shortly.
          </Text>
        ) : (
          <Text variant="body" muted className="mb-4">
            Loading order details...
          </Text>
        )}
        <Text variant="body" muted className="mb-12">
          If you have any questions, please contact us.
        </Text>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/collections">
            <Button variant="subtle">Continue Shopping</Button>
          </Link>
          {customer && (
            <Link href="/account/orders">
              <Button variant="subtle">View all orders</Button>
            </Link>
          )}
          {!customer && (
            <Link href="/journal">
              <Button variant="subtle">Read the Journal</Button>
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
