import type { Metadata, Viewport } from "next";
import { DocumentShell } from "@/components/document-shell";
import { archivo, dmMono } from "@/lib/fonts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

const description =
  "Merge PDFs, compress images, remove backgrounds and convert HEIC to JPG in your browser. Free, no account, and the file is never uploaded.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — free PDF and image tools in your browser`,
    template: `%s · ${SITE_NAME}`,
  },
  description,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/brand/mark.jpg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
    url: `${SITE_URL}/en/`,
    images: [{ url: "/brand/wordmark.jpg", width: 1376, height: 768 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description,
    images: ["/brand/wordmark.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#12110f",
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <DocumentShell locale="en">{children}</DocumentShell>
      </body>
    </html>
  );
}
