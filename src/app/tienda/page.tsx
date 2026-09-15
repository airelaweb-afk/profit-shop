import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Planners, kits de marca, facturas y packs para Instagram. Descarga inmediata.",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Catálogo</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Archivos listos para descargar
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Precios en dólares. Una compra, un archivo. Si estás construyendo un
        negocio de servicios, empieza por el Bundle Emprendedor.
      </p>
      <div className="mt-10">
        <Catalog initialCategory={categoria} />
      </div>
    </div>
  );
}
