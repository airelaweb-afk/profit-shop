import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { ProductCover } from "@/components/product-cover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/money";
import {
  getCategoryLabel,
  getProduct,
  getRelatedProducts,
  products,
} from "@/lib/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Producto" };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product.slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm text-muted-foreground">
        <Link href="/tienda" className="hover:text-foreground">
          Tienda
        </Link>
        <span className="mx-2">/</span>
        {getCategoryLabel(product.category)}
      </p>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:items-start">
        <ProductCover style={product.cover} title={product.shortName} />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
            {product.bestseller ? <Badge>Más vendido</Badge> : null}
          </div>
          <h1 className="mt-3 font-heading text-4xl tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <p className="text-2xl font-medium">{formatPrice(product.price)}</p>
            {product.compareAt ? (
              <p className="text-muted-foreground line-through">
                {formatPrice(product.compareAt)}
              </p>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.pages} · {product.format} · descarga inmediata
          </p>

          <p className="mt-6 max-w-xl text-foreground/90">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {product.includes.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton slug={product.slug} className="sm:flex-1" />
            <BuyNowButton slug={product.slug} className="sm:flex-1" />
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl">Detalles</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {product.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-2xl">Lo que dicen</h2>
          <div className="mt-4 space-y-4">
            {product.reviews.map((review) => (
              <figure key={review.name} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <blockquote className="text-sm">“{review.quote}”</blockquote>
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {review.name} · {review.city} · {"★".repeat(review.rating)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">También te sirve</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
