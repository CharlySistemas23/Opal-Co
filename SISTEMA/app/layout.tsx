import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { safeEnv } from "@/utils/safeEnv";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { SoundProvider } from "@/context/SoundContext";
import { AccountProvider } from "@/context/AccountContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { SiteTextProvider } from "@/components/providers/SiteTextProvider";
import { getSiteTextMap } from "@/lib/data/siteText";
import { Header, Footer } from "@/components/layout";
import { CartDrawer } from "@/components/product";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { SoundToggle } from "@/components/ui/SoundToggle";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(safeEnv("NEXT_PUBLIC_SITE_URL") || "https://opal-and-co.com"),
  title: {
    default: "OPAL & CO | Contemporary High Jewelry",
    template: "%s | OPAL & CO",
  },
  description:
    "A contemporary international high jewelry house. Architectural precision. Human warmth.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OPAL & CO",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: safeEnv("NEXT_PUBLIC_SITE_URL") || "https://opal-and-co.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSiteText = await getSiteTextMap();
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${sans.variable} font-sans antialiased bg-ivory text-charcoal min-h-screen`}
      >
        <SiteTextProvider initialSiteText={initialSiteText}>
        <CartProvider>
          <SearchProvider>
            <SoundProvider>
              <AccountProvider>
                <CustomerAuthProvider>
                <Header />
                <main className="pt-16 md:pt-32 min-h-screen">{children}</main>
                <Footer />
                <CartDrawer />
                <AccountDrawer />
                <SearchOverlay />
                <SoundToggle />
                </CustomerAuthProvider>
              </AccountProvider>
            </SoundProvider>
          </SearchProvider>
        </CartProvider>
        </SiteTextProvider>
      </body>
    </html>
  );
}
