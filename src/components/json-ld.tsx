import { LEGAL, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_TAGLINE,
        inLanguage: "es-ES",
      },
      {
        "@type": "Organization",
        name: LEGAL.holder,
        email: LEGAL.email,
        url: SITE_URL,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            name: "Gratis",
          },
          {
            "@type": "Offer",
            price: "29",
            priceCurrency: "EUR",
            name: "Pro anual",
          },
        ],
        description: SITE_TAGLINE,
        url: SITE_URL,
        inLanguage: "es-ES",
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
