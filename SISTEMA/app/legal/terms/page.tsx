import { Container, Heading } from "@/components/ui";
import { getLegalPageBySlug } from "@/lib/data/legal";

export const metadata = {
  title: "Terms of Service",
  description: "OPAL & CO terms of service.",
};

export default async function TermsPage() {
  const page = await getLegalPageBySlug("terms");

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          {page?.title ?? "Terms of Service"}
        </Heading>
        <div
          className="prose prose-lg max-w-none text-charcoal/90 prose-p:text-charcoal/90 prose-headings:text-charcoal"
          dangerouslySetInnerHTML={{
            __html: page?.content ?? "<p>By using this site you agree to our terms. We reserve the right to modify these terms at any time.</p>",
          }}
        />
      </Container>
    </div>
  );
}
