import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start px-4 py-20 sm:px-6">
      <p className="text-sm tracking-wide text-primary uppercase">404</p>
      <h1 className="mt-2 font-heading text-4xl">Esa página no existe</h1>
      <p className="mt-3 text-muted-foreground">
        El enlace está roto o el producto se movió. El catálogo sigue en su
        sitio.
      </p>
      <Button
        className="mt-6 h-11 px-5"
        render={<Link href="/tienda" />}
        nativeButton={false}
      >
        Ir a la tienda
      </Button>
    </div>
  );
}
