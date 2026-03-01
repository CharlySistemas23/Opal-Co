import { Container, Heading } from "@/components/ui";
import { getLegalPageBySlug } from "@/lib/data/legal";

export const metadata = {
  title: "Returns & Exchanges",
  description: "OPAL & CO returns and exchanges policy.",
};

export default async function ReturnsPage() {
  const page = await getLegalPageBySlug("returns");

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          {page?.title ?? "Returns & Exchanges"}
        </Heading>
        <div
          className="prose prose-lg max-w-none text-charcoal/90 prose-p:text-charcoal/90 prose-headings:text-charcoal"
          dangerouslySetInnerHTML={{
            __html: page?.content ?? "<p>We offer returns within 30 days of delivery for unworn pieces in original condition. Please contact us to initiate a return.</p>",
          }}
        />
      </Container>
    </div>
  );
}
