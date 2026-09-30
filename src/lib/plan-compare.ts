import { bytesLabel, FREE } from "@/lib/limits";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";

export const planRows = [
  { label: "Cuenta para usar las herramientas", free: "No hace falta", pro: "No hace falta" },
  { label: "Anuncios", free: "Ninguno", pro: "Ninguno" },
  { label: "El archivo se sube a un servidor", free: "No", pro: "No" },
  {
    label: "Unir / comprimir PDF",
    free: `Hasta ${FREE.pdfFiles} archivos y ${bytesLabel(FREE.pdfBytes)}`,
    pro: "Sin tope práctico",
  },
  {
    label: "Imágenes por tanda",
    free: `${FREE.imageFiles} · ${bytesLabel(FREE.imageBytes)}`,
    pro: "Sin tope práctico",
  },
  {
    label: "Tareas al día",
    free: `${FREE.jobsPerDay}`,
    pro: "Ilimitadas",
  },
  { label: "Rellenar campos originales del PDF", free: "Sí", pro: "Sí" },
  { label: "Firmar y marcar encima", free: "Sí", pro: "Sí" },
  { label: "Marca de agua en PDF", free: "No", pro: "Sí" },
  { label: "WebP en lote (carpeta)", free: "No", pro: "Sí" },
  { label: "Plugin WordPress WebP", free: "No", pro: "Sí" },
  {
    label: "Precio",
    free: "0 €",
    pro: `${PRO_MONTHLY}/mes o ${PRO_YEARLY}/año`,
  },
] as const;
