import Link from "next/link";
import { ProductCover } from "@/components/product-cover";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/money";
import { getCategoryLabel, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <ProductCover
          style={product.cover}
          title={product.shortName}
          className="transition duration-300 group-hover:scale-[1.02]"
        />
        {product.bestseller ? (
          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
            Más vendido
          </Badge>
        ) : null}
        {product.compareAt ? (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3"
          >
            Ahorra {formatPrice(product.compareAt - product.price)}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="font-heading text-xl leading-snug">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
        <p className="mt-1 text-sm font-medium">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
