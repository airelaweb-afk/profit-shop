"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES, products, type Category } from "@/lib/products";

export function Catalog({
  initialCategory,
}: {
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "todos">(
    CATEGORIES.some((item) => item.id === initialCategory)
      ? (initialCategory as Category)
      : "todos",
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "todos" || product.category === category;
      const matchesQuery =
        needle.length === 0 ||
        `${product.name} ${product.tagline} ${product.description}`
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={category === item.id ? "default" : "outline"}
              className="h-8"
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar plantilla, planner, factura…"
          className="h-10 max-w-sm bg-card"
          aria-label="Buscar productos"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8">
          <p className="font-heading text-2xl">Nada coincide con esa búsqueda</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Prueba con “factura”, “instagram” o “cv”. Si quieres el atajo
            completo, el Bundle Emprendedor junta marca, cobro y contenido.
          </p>
          <Button
            className="mt-5 h-10 px-4"
            render={<Link href="/producto/bundle-emprendedor" />}
            nativeButton={false}
          >
            Ver el bundle
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
