import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start px-4 py-20 sm:px-6">
      <p className="text-sm tracking-wide text-primary uppercase">404</p>
      <h1 className="mt-2 font-heading text-4xl">Esa página no existe</h1>
      <p className="mt-3 text-muted-foreground">
        El enlace está roto o la herramienta se movió. Prueba unir PDF, el blog
        o el inicio.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="h-11 px-5" render={<Link href="/" />} nativeButton={false}>
          Inicio
        </Button>
        <Button
          variant="outline"
          className="h-11 px-5"
          render={<Link href="/unir-pdf" />}
          nativeButton={false}
        >
          Unir PDF
        </Button>
        <Button
          variant="outline"
          className="h-11 px-5"
          render={<Link href="/blog" />}
          nativeButton={false}
        >
          Blog
        </Button>
      </div>
    </div>
  );
}
