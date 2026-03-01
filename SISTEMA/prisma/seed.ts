import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseConfigured, safeEnv } from "../utils/safeEnv";

async function main() {
  if (!databaseConfigured()) {
    console.warn("DATABASE_URL missing; seed skipped. Set DATABASE_URL to run the seed.");
    process.exit(0);
  }

  const adapter = new PrismaPg({ connectionString: safeEnv("DATABASE_URL") });
  const prisma = new PrismaClient({ adapter });

  // 1. Pages
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { slug: "home" },
      create: {
        slug: "home",
        title: "OPAL & CO | Contemporary High Jewelry",
        seoTitle: "OPAL & CO | Contemporary High Jewelry",
        seoDescription: "A contemporary international high jewelry house. Architectural precision. Human warmth.",
        published: true,
      },
      update: {},
    }),
    prisma.page.upsert({
      where: { slug: "the-house" },
      create: {
        slug: "the-house",
        title: "The House",
        seoTitle: "The House | OPAL & CO",
        seoDescription: "Our story. Our craft. Our commitment.",
        published: true,
      },
      update: {},
    }),
    prisma.page.upsert({
      where: { slug: "private-clients" },
      create: {
        slug: "private-clients",
        title: "Private Clients",
        seoTitle: "Private Clients | OPAL & CO",
        seoDescription: "Bespoke commissions. Private viewing. Concierge service. A relationship built on discretion.",
        published: true,
      },
      update: {},
    }),
    prisma.page.upsert({
      where: { slug: "contact" },
      create: {
        slug: "contact",
        title: "Contact",
        seoTitle: "Contact | OPAL & CO",
        seoDescription: "For inquiries, appointments, and assistance.",
        published: true,
      },
      update: {},
    }),
    prisma.page.upsert({
      where: { slug: "faq" },
      create: {
        slug: "faq",
        title: "FAQ",
        seoTitle: "FAQ | OPAL & CO",
        seoDescription: "Frequently asked questions about OPAL & CO jewelry, shipping, and care.",
        published: true,
      },
      update: {},
    }),
  ]);

  const homePage = pages[0]!;
  const theHousePage = pages[1]!;
  const privateClientsPage = pages[2]!;
  const contactPage = pages[3]!;
  const faqPage = pages[4]!;

  // 2. PageBlocks for home - delete existing and recreate for idempotency
  await prisma.pageBlock.deleteMany({ where: { pageId: homePage.id } });

  const blockTypes = [
    "HERO",
    "MANIFESTO",
    "FEATURED_PRODUCTS",
    "DUAL_NARRATIVE",
    "HIGH_JEWELRY",
    "CRAFT",
    "CTA",
    "RICH_TEXT",
    "GALLERY",
    "FAQ_LIST",
  ] as const;

  const blockData: Record<string, object> = {
    HERO: {
      headline: "OWN YOUR RADIANCE",
      backgroundImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80",
    },
    MANIFESTO: {
      headline: "The Manifesto",
      body: "Jewelry that speaks in silence. Crafted for those who understand that true luxury needs no announcement.",
    },
    FEATURED_PRODUCTS: { limit: 4 },
    DUAL_NARRATIVE: {
      leftTitle: "For Herself",
      leftText: "For the woman who chooses her own radiance. Pieces that mark milestones she defines.",
      leftImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
      rightTitle: "For Her",
      rightText: "For the discerning gift. When only exceptional will do.",
      rightImageUrl: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
    },
    HIGH_JEWELRY: { limit: 4 },
    CRAFT: {
      heading: "Material Depth",
      body: "Every piece begins with the material. Gold that carries warmth. Stones that hold light. Metal shaped by hand.",
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
    },
    CTA: {
      title: "Private Clients",
      ctaText: "Inquire",
      ctaHref: "/private-clients",
    },
    RICH_TEXT: { content: "" },
    GALLERY: { images: [] },
    FAQ_LIST: { items: [] },
  };

  for (let i = 0; i < blockTypes.length; i++) {
    const type = blockTypes[i]!;
    await prisma.pageBlock.create({
      data: {
        pageId: homePage.id,
        type,
        order: i,
        visible: true,
        dataJson: blockData[type] ?? {},
      },
    });
  }

  // 2b. PageBlocks for the-house
  await prisma.pageBlock.deleteMany({ where: { pageId: theHousePage.id } });
  const theHouseBlocks = [
    {
      type: "HERO" as const,
      dataJson: {
        headline: "The House",
        backgroundImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80",
      },
    },
    {
      type: "RICH_TEXT" as const,
      dataJson: {
        content: "<h2>Origin</h2><p>OPAL & CO was founded in 2018 on a simple belief: jewelry should carry weight without demanding attention. Each piece is conceived for those who understand that true luxury speaks in silence.</p><p>We work with master craftspeople. We choose materials with care. We take time.</p>",
      },
    },
    {
      type: "RICH_TEXT" as const,
      dataJson: {
        content: "<h2>Craft</h2><p>Every piece is made by hand. No assembly lines. No shortcuts. The process is as important as the result.</p><p>Our ateliers work in small batches. Each creation is signed. Each is traceable.</p>",
      },
    },
    {
      type: "RICH_TEXT" as const,
      dataJson: {
        content: "<h2>Materials</h2><p>Gold. Platinum. Diamonds. Sapphires. Pearls. We source only what meets our standards. No compromise on purity, cut, or provenance.</p><p>Every stone is traceable. Every metal is refined. Nothing is left to chance.</p>",
      },
    },
    {
      type: "CTA" as const,
      dataJson: {
        title: "Private Clients",
        ctaText: "Inquire",
        ctaHref: "/private-clients",
      },
    },
  ];
  for (let i = 0; i < theHouseBlocks.length; i++) {
    const b = theHouseBlocks[i]!;
    await prisma.pageBlock.create({
      data: { pageId: theHousePage.id, type: b.type, order: i, visible: true, dataJson: b.dataJson },
    });
  }

  // 2c. PageBlocks for private-clients
  await prisma.pageBlock.deleteMany({ where: { pageId: privateClientsPage.id } });
  const privateClientsBlocks = [
    {
      type: "HERO" as const,
      dataJson: {
        headline: "Private Clients",
        backgroundImageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=80",
      },
    },
    {
      type: "RICH_TEXT" as const,
      dataJson: {
        content: "<p>For those who seek the exceptional. Our Private Client program offers exclusive access, bespoke creation, and a relationship built on discretion and craftsmanship.</p><p>Whether commissioning a unique piece or exploring our archives, we are here to guide you.</p>",
      },
    },
    {
      type: "CTA" as const,
      dataJson: {
        title: "To begin a conversation",
        ctaText: "Inquire",
        ctaHref: "/contact",
      },
    },
  ];
  for (let i = 0; i < privateClientsBlocks.length; i++) {
    const b = privateClientsBlocks[i]!;
    await prisma.pageBlock.create({
      data: { pageId: privateClientsPage.id, type: b.type, order: i, visible: true, dataJson: b.dataJson },
    });
  }

  // 2d. PageBlocks for contact
  await prisma.pageBlock.deleteMany({ where: { pageId: contactPage.id } });
  const contactBlocks = [
    {
      type: "HERO" as const,
      dataJson: {
        headline: "Contact",
        subheadline: "For inquiries, appointments, and assistance. We respond within twenty-four hours.",
        backgroundImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80",
      },
    },
  ];
  for (let i = 0; i < contactBlocks.length; i++) {
    const b = contactBlocks[i]!;
    await prisma.pageBlock.create({
      data: { pageId: contactPage.id, type: b.type, order: i, visible: true, dataJson: b.dataJson },
    });
  }

  // 2e. PageBlocks for faq
  await prisma.pageBlock.deleteMany({ where: { pageId: faqPage.id } });
  await prisma.pageBlock.create({
    data: {
      pageId: faqPage.id,
      type: "FAQ_LIST",
      order: 0,
      visible: true,
      dataJson: {
        items: [
          { question: "Do you ship internationally?", answer: "Yes. We ship worldwide. Delivery times and costs depend on destination. You will receive tracking once your order ships." },
          { question: "What is your return policy?", answer: "We offer returns within 30 days of delivery for unworn pieces in original condition. Please contact us to initiate a return." },
          { question: "How should I care for my piece?", answer: "Store in a soft pouch. Avoid contact with chemicals, perfumes, and water. We provide care instructions with each purchase." },
        ],
      },
    },
  });

  // 3. Branch
  const branch = await prisma.branch.upsert({
    where: { code: "PV" },
    create: {
      name: "Puerto Vallarta",
      code: "PV",
      addressJson: {},
    },
    update: {},
  });

  // 4. MediaAssets for products
  const mediaAssets = await Promise.all([
    prisma.mediaAsset.upsert({
      where: { publicId: "radiance-ring-1" },
      create: {
        publicId: "radiance-ring-1",
        url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 1200,
        height: 800,
        folder: "products",
        tags: ["radiance-ring", "ring"],
        alt: "Radiance Ring",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "radiance-ring-2" },
      create: {
        publicId: "radiance-ring-2",
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 1200,
        height: 800,
        folder: "products",
        tags: ["radiance-ring", "detail"],
        alt: "Radiance Ring detail",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "luminance-necklace-1" },
      create: {
        publicId: "luminance-necklace-1",
        url: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 1200,
        height: 800,
        folder: "products",
        tags: ["luminance-necklace", "necklace"],
        alt: "Luminance Necklace",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "luminance-necklace-2" },
      create: {
        publicId: "luminance-necklace-2",
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 1200,
        height: 800,
        folder: "products",
        tags: ["luminance-necklace", "detail"],
        alt: "Luminance Necklace detail",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "hero-main" },
      create: {
        publicId: "hero-main",
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 1920,
        height: 1080,
        folder: "blocks",
        tags: ["hero"],
        alt: "Hero background",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "craft-section" },
      create: {
        publicId: "craft-section",
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 1200,
        height: 800,
        folder: "blocks",
        tags: ["craft"],
        alt: "Craft section",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "dual-left" },
      create: {
        publicId: "dual-left",
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 800,
        height: 600,
        folder: "blocks",
        tags: ["dual-narrative"],
        alt: "For Herself",
      },
      update: {},
    }),
    prisma.mediaAsset.upsert({
      where: { publicId: "dual-right" },
      create: {
        publicId: "dual-right",
        url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
        type: "IMAGE",
        format: "jpg",
        width: 800,
        height: 600,
        folder: "blocks",
        tags: ["dual-narrative"],
        alt: "For Her",
      },
      update: {},
    }),
  ]);

  // 5. Products + Variants
  const radianceProduct = await prisma.product.upsert({
    where: { handle: "radiance-ring" },
    create: {
      handle: "radiance-ring",
      title: "Radiance Ring",
      description: "A ring that catches light. For moments that deserve to be marked.",
      materialSummary: "18K Yellow Gold, Diamonds",
      gemstoneSummary: "Diamonds",
      careText: "Store in a soft pouch. Avoid contact with chemicals, perfumes, and water.",
      detailsText: "Handcrafted with precision. Each piece is unique.",
      byInquiry: true,
      published: true,
    },
    update: { careText: "Store in a soft pouch. Avoid contact with chemicals, perfumes, and water.", detailsText: "Handcrafted with precision. Each piece is unique." },
  });

  const luminanceProduct = await prisma.product.upsert({
    where: { handle: "luminance-necklace" },
    create: {
      handle: "luminance-necklace",
      title: "Luminance Necklace",
      description: "Light captured. A piece that defines presence.",
      materialSummary: "Platinum, Sapphires",
      gemstoneSummary: "Sapphires",
      careText: "Store in a soft pouch. Avoid contact with chemicals, perfumes, and water.",
      detailsText: "Handcrafted with precision. Each piece is unique.",
      byInquiry: true,
      published: true,
    },
    update: { careText: "Store in a soft pouch. Avoid contact with chemicals, perfumes, and water.", detailsText: "Handcrafted with precision. Each piece is unique." },
  });

  // ProductImages - delete existing and recreate
  await prisma.productImage.deleteMany({
    where: {
      productId: { in: [radianceProduct.id, luminanceProduct.id] },
    },
  });
  await prisma.productImage.createMany({
    data: [
      { productId: radianceProduct.id, mediaAssetId: mediaAssets[0]!.id, order: 0 },
      { productId: radianceProduct.id, mediaAssetId: mediaAssets[1]!.id, order: 1 },
      { productId: luminanceProduct.id, mediaAssetId: mediaAssets[2]!.id, order: 0 },
      { productId: luminanceProduct.id, mediaAssetId: mediaAssets[3]!.id, order: 1 },
    ],
  });

  // Variants (price 12500 USD = 1250000 cents, 18900 = 1890000)
  const radianceVariant = await prisma.variant.upsert({
    where: { sku: "RAD-RING-001" },
    create: {
      productId: radianceProduct.id,
      sku: "RAD-RING-001",
      title: "Default",
      priceCents: 1250000,
      currency: "USD",
      active: true,
    },
    update: {},
  });

  const luminanceVariant = await prisma.variant.upsert({
    where: { sku: "LUM-NECK-001" },
    create: {
      productId: luminanceProduct.id,
      sku: "LUM-NECK-001",
      title: "Default",
      priceCents: 1890000,
      currency: "USD",
      active: true,
    },
    update: {},
  });

  // 5b. Collections + ProductCollection
  const highJewelryCollection = await prisma.collection.upsert({
    where: { slug: "high-jewelry" },
    create: {
      slug: "high-jewelry",
      title: "High Jewelry",
      description: "One-of-a-kind creations. Master craftsmanship. Timeless design.",
      published: true,
    },
    update: {},
  });

  await prisma.collection.upsert({
    where: { slug: "for-herself" },
    create: { slug: "for-herself", title: "For Herself", description: "Pieces for the woman who chooses her own radiance.", published: true },
    update: {},
  });
  await prisma.collection.upsert({
    where: { slug: "for-her" },
    create: { slug: "for-her", title: "For Her", description: "For the discerning gift. When only exceptional will do.", published: true },
    update: {},
  });
  await prisma.collection.upsert({
    where: { slug: "signature" },
    create: { slug: "signature", title: "Signature", description: "Our signature collection.", published: true },
    update: {},
  });

  await prisma.productCollection.upsert({
    where: {
      productId_collectionId: {
        productId: radianceProduct.id,
        collectionId: highJewelryCollection.id,
      },
    },
    create: {
      productId: radianceProduct.id,
      collectionId: highJewelryCollection.id,
      order: 0,
    },
    update: { order: 0 },
  });

  await prisma.productCollection.upsert({
    where: {
      productId_collectionId: {
        productId: luminanceProduct.id,
        collectionId: highJewelryCollection.id,
      },
    },
    create: {
      productId: luminanceProduct.id,
      collectionId: highJewelryCollection.id,
      order: 1,
    },
    update: { order: 1 },
  });

  // 6. StockLevels
  await prisma.stockLevel.upsert({
    where: {
      branchId_variantId: {
        branchId: branch.id,
        variantId: radianceVariant.id,
      },
    },
    create: {
      branchId: branch.id,
      variantId: radianceVariant.id,
      quantity: 2,
    },
    update: { quantity: 2 },
  });

  await prisma.stockLevel.upsert({
    where: {
      branchId_variantId: {
        branchId: branch.id,
        variantId: luminanceVariant.id,
      },
    },
    create: {
      branchId: branch.id,
      variantId: luminanceVariant.id,
      quantity: 1,
    },
    update: { quantity: 1 },
  });

  // 7. Stores
  await prisma.store.upsert({
    where: { slug: "new-york" },
    create: { slug: "new-york", name: "New York", address: "By appointment only", city: "New York", country: "United States", order: 0 },
    update: {},
  });
  await prisma.store.upsert({
    where: { slug: "london" },
    create: { slug: "london", name: "London", address: "By appointment only", city: "London", country: "United Kingdom", order: 1 },
    update: {},
  });

  // 8. SiteSettings (Site Text)
  const siteTextDefaults: Array<{ key: string; value: string }> = [
    { key: "cart_title", value: "Your Bag" },
    { key: "cart_close", value: "Close" },
    { key: "cart_empty_message", value: "Your bag is empty." },
    { key: "cart_continue_shopping", value: "Continue shopping" },
    { key: "cart_view_bag", value: "View bag" },
    { key: "cart_checkout", value: "Proceed to Checkout" },
    { key: "footer_copyright", value: "All rights reserved." },
    { key: "footer_legal_title", value: "Legal" },
    { key: "header_brand_text", value: "OPAL & CO" },
  ];
  for (const { key, value } of siteTextDefaults) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }

  // 9. Legal pages
  const legalPages = [
    { slug: "privacy", title: "Privacy Policy", content: "<p>We respect your privacy. Data collected through this site is used only to process inquiries, appointments, and orders and to improve our service. We do not sell your data to third parties.</p><p>For questions, contact us at inquiries@opal-and-co.com.</p>" },
    { slug: "terms", title: "Terms of Service", content: "<p>By using this site you agree to our terms. We reserve the right to modify these terms at any time.</p>" },
    { slug: "returns", title: "Returns", content: "<p>We offer returns within 30 days of delivery for unworn pieces in original condition. Please contact us to initiate a return.</p>" },
    { slug: "cookies", title: "Cookies", content: "<p>We use cookies to improve your experience. By continuing you accept our use of cookies.</p>" },
  ];
  for (const lp of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: lp.slug },
      create: lp,
      update: { title: lp.title, content: lp.content },
    });
  }

  // 10. Owner user (only when ADMIN_OWNER_EMAIL is set)
  const ownerEmail = safeEnv("ADMIN_OWNER_EMAIL");
  if (ownerEmail) {
    await prisma.staffUser.upsert({
      where: { email: ownerEmail.trim().toLowerCase() },
      create: {
        email: ownerEmail.trim().toLowerCase(),
        name: "Owner",
        role: "OWNER",
        status: "ACTIVE",
      },
      update: { role: "OWNER", status: "ACTIVE" },
    });
  }

  console.log("Seed completed successfully.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
