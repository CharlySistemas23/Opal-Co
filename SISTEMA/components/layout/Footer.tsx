import { Container, Link, Divider } from "@/components/ui";

const footerLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/high-jewelry", label: "High Jewelry" },
  { href: "/the-house", label: "The House" },
  { href: "/journal", label: "Journal" },
  { href: "/private-clients", label: "Private Clients" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-ivory py-20 md:py-30">
      <Container>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          <span className="font-serif text-2xl tracking-tight whitespace-nowrap">OPAL & CO</span>

          <nav
            className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-8 sm:gap-y-0 gap-x-10 gap-y-4"
            aria-label="Footer navigation"
          >
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-sans text-sm uppercase tracking-[0.15em] text-ivory/90 hover:text-champagne no-underline transition-colors duration-fast"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Divider className="my-12 border-ivory/20" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="font-sans text-sm text-ivory/60 order-2 sm:order-1">
            © {currentYear} OPAL & CO. All rights reserved.
          </p>
          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8 order-1 sm:order-2"
            aria-label="Legal"
          >
            <Link href="/legal/privacy" className="font-sans text-xs uppercase tracking-[0.1em] text-ivory/60 hover:text-ivory/90 no-underline transition-colors duration-fast">
              Privacy
            </Link>
            <Link href="/legal/terms" className="font-sans text-xs uppercase tracking-[0.1em] text-ivory/60 hover:text-ivory/90 no-underline transition-colors duration-fast">
              Terms
            </Link>
            <Link href="/legal/returns" className="font-sans text-xs uppercase tracking-[0.1em] text-ivory/60 hover:text-ivory/90 no-underline transition-colors duration-fast">
              Returns
            </Link>
            <Link href="/legal/cookies" className="font-sans text-xs uppercase tracking-[0.1em] text-ivory/60 hover:text-ivory/90 no-underline transition-colors duration-fast">
              Cookies
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
