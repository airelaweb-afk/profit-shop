import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export function legalMeta(
  title: string,
  description: string,
  path: string,
  locale: "es" | "en" = "es",
): Metadata {
  return pageMeta({ title, description, path, locale });
}

export function LegalShell({
  kicker,
  title,
  children,
  locale = "es",
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  locale?: "es" | "en";
}) {
  const links =
    locale === "en"
      ? [
          ["/en/contact/", "Contact"],
          ["/en/legal-notice/", "Legal notice"],
          ["/en/privacy/", "Privacy"],
          ["/en/cookies/", "Cookies"],
          ["/en/terms/", "Terms"],
        ]
      : [
          ["/contacto/", "Contacto"],
          ["/aviso-legal/", "Aviso legal"],
          ["/privacidad/", "Privacidad"],
          ["/cookies/", "Cookies"],
          ["/condiciones/", "Condiciones"],
        ];
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">{kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {title}
      </h1>
      <div className="mt-8 space-y-4 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-foreground [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
        {children}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        {links.map((link, index) => (
          <span key={link[0]}>
            {index > 0 ? " · " : null}
            <Link href={link[0]}>{link[1]}</Link>
          </span>
        ))}
      </p>
    </article>
  );
}
