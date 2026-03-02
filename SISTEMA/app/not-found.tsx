import Link from "next/link";
import { Container, Heading, Text, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <Container className="text-center py-20">
        <Heading as="h1" level={2} className="mb-6 text-charcoal">
          Page not found
        </Heading>
        <Text variant="body" muted className="mb-12 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </Text>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button variant="subtle">Return home</Button>
          </Link>
          <Link href="/contact">
            <Button variant="subtle">Contact us</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
