import { Container, Heading } from "@/components/ui";
import { getLegalPageBySlug } from "@/lib/data/legal";

export const metadata = {
  title: "Privacy Policy",
  description: "OPAL & CO privacy policy.",
};

export default async function PrivacyPage() {
  const page = await getLegalPageBySlug("privacy");

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          {page?.title ?? "Privacy Policy"}
        </Heading>
        <div
          className="prose prose-lg max-w-none text-charcoal/90 prose-p:text-charcoal/90 prose-headings:text-charcoal"
          dangerouslySetInnerHTML={{
            __html: page?.content ?? "<p>We respect your privacy. Data collected through this site is used only to process inquiries, appointments, and orders and to improve our service. We do not sell your data to third parties.</p><p>For questions, contact us at inquiries@opal-and-co.com.</p>",
          }}
        />
      </Container>
    </div>
  );
}
