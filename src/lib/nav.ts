export const officeLinks = [
  { href: "/presupuestos", label: "Presupuestos" },
  { href: "/versiones", label: "Versiones" },
  { href: "/cobros", label: "Cobros" },
  { href: "/horas", label: "Horas" },
  { href: "/gastos", label: "Gastos" },
] as const;

export const kitLinks = [
  { href: "/herramientas-pdf", label: "PDF" },
  { href: "/herramientas-imagen", label: "Imagen" },
] as const;

export const allNavLinks = [...officeLinks, ...kitLinks];

const pdfPaths = new Set([
  "/herramientas-pdf",
  "/unir-pdf",
  "/dividir-pdf",
  "/comprimir-pdf",
  "/jpg-a-pdf",
  "/pdf-a-jpg",
  "/pdf",
  "/rotar-pdf",
  "/numerar-pdf",
  "/marca-de-agua-pdf",
  "/juntar-pdf",
  "/combinar-pdf",
  "/aligerar-pdf",
  "/eliminar-paginas-pdf",
]);

const imagePaths = new Set([
  "/herramientas-imagen",
  "/comprimir-imagen",
  "/png-a-jpg",
  "/jpg-a-png",
  "/jpg-a-webp",
  "/heic-a-jpg",
  "/redimensionar-imagen",
  "/recortar-imagen",
  "/girar-imagen",
  "/webp-en-lote",
  "/plugin-wordpress-webp",
  "/audio-a-wav",
  "/recortar-audio",
]);

const officePaths = new Set<string>(officeLinks.map((link) => link.href));

export function cleanPath(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : "/";
}

export function isPdfPath(pathname: string) {
  return pdfPaths.has(cleanPath(pathname));
}

export function isImagePath(pathname: string) {
  return imagePaths.has(cleanPath(pathname));
}

export function isOfficePath(pathname: string) {
  return officePaths.has(cleanPath(pathname));
}
