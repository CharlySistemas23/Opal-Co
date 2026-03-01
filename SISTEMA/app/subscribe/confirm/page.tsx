import Link from "next/link";
import { Container, Heading, Text, Button } from "@/components/ui";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { verifySubscriberToken } from "@/lib/subscriber-verify";
import { sendWithTemplate } from "@/lib/email/provider";

export const metadata = {
  title: "Confirm Subscription",
  description: "Confirm your newsletter subscription.",
};

export default async function SubscribeConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string | string[] };
}) {
  const raw = searchParams.token;
  const token =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;

  if (!token) {
    return (
      <div className="min-h-screen py-20 md:py-30 flex items-center">
        <Container className="max-w-xl mx-auto text-center">
          <Heading as="h1" level={2} className="text-charcoal mb-8">
            Invalid or expired link
          </Heading>
          <Text variant="body" muted className="mb-12">
            This confirmation link is invalid or has expired. Please try
            subscribing again.
          </Text>
          <Link href="/">
            <Button variant="subtle">Return to homepage</Button>
          </Link>
        </Container>
      </div>
    );
  }

  if (!databaseConfigured() || !db) {
    return (
      <div className="min-h-screen py-20 md:py-30 flex items-center">
        <Container className="max-w-xl mx-auto text-center">
          <Heading as="h1" level={2} className="text-charcoal mb-8">
            You&apos;re subscribed
          </Heading>
          <Text variant="body" muted className="mb-12">
            Thank you for subscribing. We look forward to sharing our latest
            collections and stories with you.
          </Text>
          <Link href="/">
            <Button variant="subtle">Return to homepage</Button>
          </Link>
        </Container>
      </div>
    );
  }

  const pendingSubs = await db.subscriber.findMany({
    where: {
      status: "PENDING",
      verifyTokenHash: { not: null },
      verifyExpiresAt: { gt: new Date() },
    },
  });

  let matched = null;
  for (const sub of pendingSubs) {
    if (sub.verifyTokenHash && verifySubscriberToken(token, sub.verifyTokenHash)) {
      matched = sub;
      break;
    }
  }

  if (!matched) {
    return (
      <div className="min-h-screen py-20 md:py-30 flex items-center">
        <Container className="max-w-xl mx-auto text-center">
          <Heading as="h1" level={2} className="text-charcoal mb-8">
            Invalid or expired link
          </Heading>
          <Text variant="body" muted className="mb-12">
            This confirmation link is invalid or has expired. Please try
            subscribing again.
          </Text>
          <Link href="/">
            <Button variant="subtle">Return to homepage</Button>
          </Link>
        </Container>
      </div>
    );
  }

  await db.subscriber.update({
    where: { id: matched.id },
    data: {
      status: "SUBSCRIBED",
      confirmedAt: new Date(),
      verifyTokenHash: null,
      verifyExpiresAt: null,
    },
  });

  await sendWithTemplate({
    to: matched.email,
    template: "welcome",
    variables: {},
  }).catch((err) => console.error("[subscribe/confirm] Welcome email failed:", err));

  return (
    <div className="min-h-screen py-20 md:py-30 flex items-center">
      <Container className="max-w-xl mx-auto text-center">
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          You&apos;re subscribed
        </Heading>
        <Text variant="body" muted className="mb-12">
          Thank you for confirming your subscription. We look forward to sharing
          our latest collections and stories with you.
        </Text>
        <Link href="/">
          <Button variant="subtle">Return to homepage</Button>
        </Link>
      </Container>
    </div>
  );
}
