import { Container, Heading } from "@/components/ui";
import { getLegalPageBySlug } from "@/lib/data/legal";

export const metadata = {
  title: "Cookie Policy",
  description: "OPAL & CO cookie policy.",
};

export default async function CookiesPage() {
  const page = await getLegalPageBySlug("cookies");

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          {page?.title ?? "Cookie Policy"}
        </Heading>
        <div
          className="prose prose-lg max-w-none text-charcoal/90 prose-p:text-charcoal/90 prose-headings:text-charcoal"
          dangerouslySetInnerHTML={{
            __html: page?.content ?? "<p>We use cookies to improve your experience. By continuing you accept our use of cookies.</p>",
          }}
        />
      </Container>
    </div>
  );
}
