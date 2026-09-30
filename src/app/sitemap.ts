import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { imageKit, audioKit } from "@/lib/image-kit";
import { allPdfTools } from "@/lib/pdf-kit";
import { SITE_URL } from "@/lib/site";

const staticPaths = [
  "/",
  "/blog/",
  "/faq/",
  "/precios/",
  "/como-funciona/",
  "/entrar/",
  "/aviso-legal/",
  "/privacidad/",
  "/cookies/",
  "/condiciones/",
  "/contacto/",
  "/herramientas-pdf/",
  "/herramientas-imagen/",
  "/presupuestos/",
  "/versiones/",
  "/cobros/",
  "/horas/",
  "/gastos/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-30");
  const pages = [
    ...staticPaths.map((path) => ({
      url: `${SITE_URL}${path === "/" ? "/" : path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : path === "/blog/" || path === "/faq/" ? 0.8 : 0.7,
    })),
    ...allPdfTools.map((tool) => ({
      url: `${SITE_URL}${tool.href}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
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
  ];
  const seen = new Set<string>();
  return pages.filter((page) => {
    if (seen.has(page.url)) return false;
    seen.add(page.url);
    return true;
  });
}
