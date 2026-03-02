import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { ContactForm } from "./ContactForm";
import { getPageBySlug } from "@/lib/data/pages";
import { getSiteTextMap } from "@/lib/data/siteText";
import { Container } from "@/components/ui";

export const metadata = {
  title: "Contact",
  description: "For inquiries, appointments, and assistance.",
};

export default async function ContactPage() {
  const [page, siteText] = await Promise.all([
    getPageBySlug("contact"),
    getSiteTextMap(),
  ]);
  const blocks = page?.blocks ?? [];
  const fallbackTitle = siteText.contact_fallback_title || "Contact";
  const fallbackBody = siteText.contact_fallback_body || "For inquiries, appointments, and assistance. We respond within twenty-four hours.";
  const fallbackEmail = siteText.contact_fallback_email || "inquiries@opal-and-co.com";
  const fallbackAppointment = siteText.contact_fallback_appointment || "By appointment only";

  return (
    <div className="min-h-screen">
      {blocks.length > 0 ? (
        <BlockRenderer
          blocks={blocks.map((b) => ({
            id: b.id,
            type: b.type,
            order: b.order,
            visible: b.visible,
            dataJson: b.dataJson,
          }))}
        />
      ) : (
        <section className="py-24 md:py-32 bg-stone">
          <Container className="text-center">
            <h1 className="text-2xl font-serif text-charcoal mb-6 tracking-[0.15em] uppercase">
              {fallbackTitle}
            </h1>
            <p className="text-charcoal/70 max-w-xl mx-auto mb-12">
              {fallbackBody}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 text-charcoal/80 font-sans text-sm">
              <span>{fallbackEmail}</span>
              <span>{fallbackAppointment}</span>
            </div>
          </Container>
        </section>
      )}
      <div className="py-20 md:py-30">
        <Container className="max-w-xl">
          <ContactForm />
        </Container>
      </div>
    </div>
  );
}
