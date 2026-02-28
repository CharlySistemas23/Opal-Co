"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container, Heading, Text, Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <Container className="text-center py-20">
        <Heading as="h1" level={2} className="mb-6 text-charcoal">
          Something went wrong
        </Heading>
        <Text variant="body" muted className="mb-12 max-w-md mx-auto">
          We encountered an error. Please try again or return home.
        </Text>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="subtle" onClick={reset}>
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Return home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Contact us
          </Link>
        </div>
      </Container>
    </div>
  );
}
