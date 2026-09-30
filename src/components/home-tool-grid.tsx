import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Combine,
  Scissors,
  Minimize2,
  Images,
  FileImage,
  PenLine,
  RotateCw,
  Hash,
  Droplets,
  FileX,
  Shrink,
  ArrowRightLeft,
  Smartphone,
  Crop,
  Maximize2,
  Layers,
  Puzzle,
  FileText,
  TextCursorInput,
  ListOrdered,
  Receipt,
  Clock3,
  Wallet,
} from "lucide-react";
import { allPdfTools } from "@/lib/pdf-kit";
import { imageKit, imageProKit } from "@/lib/image-kit";

const ICONS: Record<string, LucideIcon> = {
  "/unir-pdf": Combine,
  "/dividir-pdf": Scissors,
  "/comprimir-pdf": Minimize2,
  "/jpg-a-pdf": Images,
  "/pdf-a-jpg": FileImage,
  "/pdf": PenLine,
  "/rellenar-pdf": TextCursorInput,
  "/rotar-pdf": RotateCw,
  "/numerar-pdf": Hash,
  "/eliminar-paginas-pdf": FileX,
  "/marca-de-agua-pdf": Droplets,
  "/comprimir-imagen": Shrink,
  "/png-a-jpg": ArrowRightLeft,
  "/jpg-a-png": ArrowRightLeft,
  "/jpg-a-webp": ArrowRightLeft,
  "/heic-a-jpg": Smartphone,
  "/redimensionar-imagen": Maximize2,
  "/recortar-imagen": Crop,
  "/girar-imagen": RotateCw,
  "/webp-en-lote": Layers,
  "/plugin-wordpress-webp": Puzzle,
  "/presupuestos": FileText,
  "/versiones": ListOrdered,
  "/cobros": Receipt,
  "/horas": Clock3,
  "/gastos": Wallet,
};

const BLURB: Record<string, string> = {
  "/unir-pdf": "Varios PDF en uno, en el orden que quieras.",
  "/dividir-pdf": "Saca un rango o un PDF por página.",
  "/comprimir-pdf": "Que entre en el correo.",
  "/jpg-a-pdf": "Fotos a un PDF A4.",
  "/pdf-a-jpg": "Cada hoja, un JPG.",
  "/pdf": "Rúbrica y marcas encima.",
  "/rellenar-pdf": "Campos originales del formulario.",
  "/rotar-pdf": "90, 180 o 270 grados.",
  "/numerar-pdf": "Número al pie de cada hoja.",
  "/eliminar-paginas-pdf": "Quita 2, 5-7 y descarga el resto.",
  "/marca-de-agua-pdf": "BORRADOR o CONFIDENCIAL en cada página.",
  "/comprimir-imagen": "Baja el peso de JPG, PNG o WebP.",
  "/png-a-jpg": "PNG, WebP o HEIC a JPG.",
  "/jpg-a-png": "JPG o WebP a PNG.",
  "/jpg-a-webp": "JPG o PNG a WebP.",
  "/heic-a-jpg": "La foto del iPhone, en JPG.",
  "/redimensionar-imagen": "Al ancho o alto que te piden.",
  "/recortar-imagen": "Quédate con el trozo que vale.",
  "/girar-imagen": "Endereza la foto del móvil.",
  "/webp-en-lote": "Toda la carpeta a WebP, en un zip.",
  "/plugin-wordpress-webp": "Toda la biblioteca de medios a WebP.",
  "/presupuestos": "Un PDF por cliente, con tu logo.",
  "/versiones": "Varias ofertas en el mismo papel.",
  "/cobros": "Mensaje de impago, listo para enviar.",
  "/horas": "La semana, en un parte PDF.",
  "/gastos": "Tickets, base e IVA.",
};

const office = [
  { href: "/presupuestos", name: "Presupuestos" },
  { href: "/versiones", name: "Versiones" },
  { href: "/cobros", name: "Avisos de cobro" },
  { href: "/horas", name: "Parte de horas" },
  { href: "/gastos", name: "Relación de gastos" },
];

function Tile({
  href,
  name,
  pro,
}: {
  href: string;
  name: string;
  pro?: boolean;
}) {
  const Icon = ICONS[href] ?? FileText;
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-[2px] border-2 border-foreground/10 bg-card p-4 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary hover:shadow-[6px_6px_0_0_#ff4b1a]"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[2px] bg-foreground text-accent">
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="font-heading text-lg leading-tight">{name}</span>
          {pro ? (
            <span className="font-mono text-[0.65rem] tracking-[0.14em] text-primary uppercase">
              Pro
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {BLURB[href] ?? ""}
        </span>
      </span>
    </Link>
  );
}

export function HomeToolGrid() {
  return (
    <div id="herramientas" className="scroll-mt-20">
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
          PDF
        </p>
        <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Herramientas PDF</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Sin cuenta. El archivo no se sube. Gratis con un tope; Pro, sin límite.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allPdfTools.map((tool) => (
            <li key={tool.href}>
              <Tile href={tool.href} name={tool.name} pro={"pro" in tool && tool.pro} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y-2 border-foreground/10 bg-card/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
            Imagen
          </p>
          <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Herramientas de imagen</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Comprimir, HEIC, WebP. En lote y el plugin de WordPress son Pro.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...imageKit, ...imageProKit].map((tool) => (
              <li key={tool.href}>
                <Tile href={tool.href} name={tool.name} pro={"pro" in tool && tool.pro} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <p className="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
          Documentos
        </p>
        <h2 className="mt-2 font-heading text-3xl sm:text-4xl">Documentos de trabajo</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Pegas los datos y sale el PDF. Gratis, con tope de tandas.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {office.map((tool) => (
            <li key={tool.href}>
              <Tile href={tool.href} name={tool.name} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
