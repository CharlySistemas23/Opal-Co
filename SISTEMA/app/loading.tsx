import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-ivory">
      <Container className="py-20">
        <div
          className="h-8 w-8 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mx-auto"
          aria-hidden
        />
        <p className="sr-only">Loading</p>
      </Container>
    </div>
  );
}
