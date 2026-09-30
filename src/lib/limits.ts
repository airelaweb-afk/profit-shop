/** Límites de cortesía del plan gratis. Pro no tiene tope práctico (el navegador sí). */

export const FREE = {
  pdfFiles: 5,
  pdfBytes: 20 * 1024 * 1024,
  pdfPages: 40,
  imagesToPdf: 8,
  imageFiles: 5,
  imageBytes: 10 * 1024 * 1024,
  quotes: 5,
  jobsPerDay: 10,
} as const;

export const PRO_CAPS = {
  pdfFiles: 80,
  pdfBytes: 80 * 1024 * 1024,
  pdfPages: 400,
  imagesToPdf: 80,
  imageFiles: 80,
  imageBytes: 40 * 1024 * 1024,
  quotes: 80,
  jobsPerDay: Number.POSITIVE_INFINITY,
} as const;

export function caps(pro: boolean) {
  return pro ? PRO_CAPS : FREE;
}

export function bytesLabel(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
