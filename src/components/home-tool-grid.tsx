"use client";

import { useMemo, useState } from "react";
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
  Type,
  ListOrdered,
  Receipt,
  Clock3,
  Wallet,
  AudioLines,
  Music,
} from "lucide-react";
import { allPdfTools } from "@/lib/pdf-kit";
import { audioKit, imageKit, imageProKit } from "@/lib/image-kit";

const ICONS: Record<string, LucideIcon> = {
  "/unir-pdf": Combine,
  "/dividir-pdf": Scissors,
  "/comprimir-pdf": Minimize2,
  "/jpg-a-pdf": Images,
  "/pdf-a-jpg": FileImage,
  "/pdf": PenLine,
  "/rellenar-pdf": TextCursorInput,
  "/editar-pdf": Type,
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
  "/audio-a-wav": Music,
  "/recortar-audio": AudioLines,
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
  "/editar-pdf": "Frases de la página u OCR del escaneo.",
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
  "/audio-a-wav": "MP3, M4A u OGG a WAV, en el navegador.",
  "/recortar-audio": "Marcas inicio y fin; sales con un WAV.",
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

type TileData = { href: string; name: string; pro?: boolean };

const ALL_TILES: TileData[] = [
  ...allPdfTools.map((tool) => ({
    href: tool.href,
    name: tool.name,
    pro: "pro" in tool && tool.pro,
  })),
  ...[...imageKit, ...imageProKit].map((tool) => ({
    href: tool.href,
    name: tool.name,
    pro: "pro" in tool && tool.pro,
  })),
  ...audioKit.map((tool) => ({ href: tool.href, name: tool.name })),
  ...office,
];

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "pdf", label: "PDF" },
  { id: "sort", label: "Ordenar PDF" },
  { id: "optimize", label: "Optimizar PDF" },
  { id: "convert", label: "Convertir" },
  { id: "edit", label: "Editar PDF" },
  { id: "image", label: "Imagen" },
  { id: "audio", label: "Audio" },
  { id: "docs", label: "Documentos" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const FILTER_HREFS: Record<Exclude<FilterId, "all">, string[]> = {
  pdf: allPdfTools.map((tool) => tool.href),
  sort: ["/unir-pdf", "/dividir-pdf", "/eliminar-paginas-pdf", "/rotar-pdf"],
  optimize: ["/comprimir-pdf"],
  convert: [
    "/jpg-a-pdf",
    "/pdf-a-jpg",
    "/png-a-jpg",
    "/jpg-a-png",
    "/jpg-a-webp",
    "/heic-a-jpg",
    "/audio-a-wav",
  ],
  edit: [
    "/editar-pdf",
    "/rellenar-pdf",
    "/pdf",
    "/marca-de-agua-pdf",
    "/numerar-pdf",
  ],
  image: [...imageKit, ...imageProKit].map((tool) => tool.href),
  audio: audioKit.map((tool) => tool.href),
  docs: office.map((tool) => tool.href),
};

function Tile({ href, name, pro }: TileData) {
  const Icon = ICONS[href] ?? FileText;
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[6px_6px_0_0_#ff4b1a]"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" strokeWidth={2} />
      </span>
      <span className="mt-4 flex items-baseline gap-2">
        <span className="font-heading text-xl leading-tight">{name}</span>
        {pro ? (
          <span className="font-mono text-[0.65rem] tracking-[0.14em] text-primary uppercase">
            Pro
          </span>
        ) : null}
      </span>
      <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {BLURB[href] ?? ""}
      </span>
    </Link>
  );
}

export function HomeToolGrid() {
  const [filter, setFilter] = useState<FilterId>("all");
  const tiles = useMemo(() => {
    if (filter === "all") return ALL_TILES;
    const allow = new Set(FILTER_HREFS[filter]);
    return ALL_TILES.filter((tile) => allow.has(tile.href));
  }, [filter]);

  return (
    <div id="herramientas" className="scroll-mt-20 bg-[#f7f4ee] py-12 sm:py-16">
      <div className="luna-wrap">
        <h2 className="text-center font-heading text-3xl tracking-tight sm:text-5xl">
          Herramientas online para PDF, imagen y audio
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Sin cuenta. El archivo no se sube. Gratis con un tope; Pro, sin límite.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((item) => {
            const on = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  on
                    ? "bg-foreground text-background"
                    : "bg-card text-foreground ring-1 ring-foreground/10 hover:ring-foreground/30"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tiles.map((tool) => (
            <li key={tool.href}>
              <Tile href={tool.href} name={tool.name} pro={tool.pro} />
            </li>
          ))}
        </ul>
        {tiles.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No hay herramientas en este filtro.
          </p>
        ) : null}
      </div>
    </div>
  );
}
