import type { Metadata, Viewport } from "next";
import { Archivo, DM_Mono } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { MobileDock } from "@/components/mobile-dock";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — unir PDF, comprimir imagen y presupuestos`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  keywords: [
    "unir pdf",
    "comprimir pdf",
    "comprimir imagen",
    "heic a jpg",
    "firmar pdf",
    "jpg a pdf",
    "presupuestos autonomos",
    "marca de agua pdf",
    "rotar pdf",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/brand/mark.jpg",
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
    url: SITE_URL,
    images: [{ url: "/brand/wordmark.jpg", width: 1376, height: 768 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: ["/brand/wordmark.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f0e6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd />
        <Providers>
          <SiteHeader />
          <main className="flex-1 pb-dock">{children}</main>
          <SiteFooter />
          <MobileDock />
        </Providers>
      </body>
    </html>
  );
}
