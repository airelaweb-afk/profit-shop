import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { competitors } from "@/lib/comparisons";
import { imageKit, imageProKit, audioKit } from "@/lib/image-kit";
import { localePairs, pairForPath } from "@/lib/locale";
import { allPdfTools } from "@/lib/pdf-kit";
import { absUrl } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const staticPaths = [
  "/",
  "/blog/",
  "/faq/",
  "/precios/",
  "/como-funciona/",
  "/aviso-legal/",
  "/privacidad/",
  "/cookies/",
  "/condiciones/",
  "/contacto/",
  "/comparar/",
  "/juntar-pdf/",
  "/combinar-pdf/",
  "/aligerar-pdf/",
  "/herramientas-pdf/",
  "/herramientas-imagen/",
  "/presupuestos/",
  "/versiones/",
  "/cobros/",
  "/horas/",
  "/gastos/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-22");
  const pages = [
    ...staticPaths.map((path) => ({
      url: `${SITE_URL}${path === "/" ? "/" : path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : path === "/blog/" || path === "/faq/" ? 0.8 : 0.7,
    })),
    ...competitors.map((item) => ({
      url: `${SITE_URL}${item.href}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...allPdfTools.map((tool) => ({
      url: `${SITE_URL}${tool.href}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...imageProKit.map((tool) => ({
      url: `${SITE_URL}${tool.href}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...imageKit.map((tool) => ({
      url: `${SITE_URL}${tool.href}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...audioKit.map((tool) => ({
      url: `${SITE_URL}${tool.href}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}/`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...localePairs.map((pair) => ({
      url: absUrl(pair.en),
      lastModified: new Date("2026-10-23"),
      changeFrequency: "weekly" as const,
      priority: pair.en === "/en" ? 0.9 : 0.8,
    })),
  ];
  const seen = new Set<string>();
  return pages
    .filter((page) => {
      if (seen.has(page.url)) return false;
      seen.add(page.url);
      return true;
    })
    .map((page) => {
      const path = page.url.slice(SITE_URL.length).replace(/\/$/, "") || "/";
      const pair = pairForPath(path);
      if (!pair) return page;
      return {
        ...page,
        alternates: {
          languages: {
            es: absUrl(pair.es),
            en: absUrl(pair.en),
            "x-default": absUrl(pair.es),
          },
        },
      };
    });
}
