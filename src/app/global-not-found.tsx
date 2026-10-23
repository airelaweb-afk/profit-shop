import type { Metadata } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/document-shell";
import { Button } from "@/components/ui/button";
import { archivo, dmMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function GlobalNotFound() {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <DocumentShell locale="es">
          <div className="mx-auto flex w-full max-w-xl flex-col items-start px-4 py-20 sm:px-6">
            <p className="text-sm tracking-wide text-primary uppercase">404</p>
            <h1 className="mt-2 font-heading text-4xl">Esa página no existe</h1>
            <p className="mt-3 text-muted-foreground">
              El enlace está roto o la herramienta se movió. Prueba unir PDF, el blog
              o el inicio.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="h-11 px-5" render={<Link href="/" prefetch={false} />} nativeButton={false}>
                Inicio
              </Button>
              <Button
                variant="outline"
                className="h-11 px-5"
                render={<Link href="/unir-pdf" prefetch={false} />}
                nativeButton={false}
              >
                Unir PDF
              </Button>
              <Button
                variant="outline"
                className="h-11 px-5"
                render={<Link href="/blog" prefetch={false} />}
                nativeButton={false}
              >
                Blog
              </Button>
            </div>
          </div>
        </DocumentShell>
      </body>
    </html>
  );
}
