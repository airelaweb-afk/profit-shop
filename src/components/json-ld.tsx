import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";
import { absUrl } from "@/lib/seo";
import { LEGAL, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

function euros(label: string) {
  return label.replace(/[^\d.,]/g, "").replace(",", ".");
}

function Script({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

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
        logo: `${SITE_URL}/brand/mark.jpg`,
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
            price: euros(PRO_MONTHLY),
            priceCurrency: "EUR",
            name: "Pro mensual",
          },
          {
            "@type": "Offer",
            price: euros(PRO_YEARLY),
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
  return <Script data={data} />;
}

export function ToolJsonLd({
  name,
  description,
  path,
  section,
  free = true,
}: {
  name: string;
  description: string;
  path: string;
  section: { name: string; path: string };
  free?: boolean;
}) {
  const url = absUrl(path);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name,
        url,
        description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        browserRequirements: "Requiere un navegador moderno con JavaScript.",
        isAccessibleForFree: free,
        inLanguage: "es-ES",
        offers: {
          "@type": "Offer",
          price: free ? "0" : euros(PRO_MONTHLY),
          priceCurrency: "EUR",
        },
        publisher: { "@type": "Organization", name: LEGAL.holder, url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: section.name,
            item: absUrl(section.path),
          },
          { "@type": "ListItem", position: 3, name, item: url },
        ],
      },
    ],
  };
  return <Script data={data} />;
}
