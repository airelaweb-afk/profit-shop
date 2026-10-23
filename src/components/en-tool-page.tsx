import Link from "next/link";
import type { ReactNode } from "react";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { ToolJsonLd } from "@/components/json-ld";
import { enTools, type EnToolCopy } from "@/lib/en-copy";

export function EnToolPage({ copy, children }: { copy: EnToolCopy; children: ReactNode }) {
  const others = enTools.filter((tool) => tool.href !== `${copy.path}/`);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ToolJsonLd
        name={copy.name}
        description={copy.meta}
        path={copy.path}
        section={{ name: "Tools", path: "/en" }}
        locale="en"
      />
      <FaqJsonLd items={copy.faqs} />
      <p className="text-sm tracking-wide text-primary uppercase">{copy.kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {copy.name}. <span className="text-primary">{copy.slogan}</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{copy.lead}</p>
      <div className="mt-10">{children}</div>
      {copy.steps || copy.uses ? (
        <section className="mt-14 grid gap-8 md:grid-cols-2">
          {copy.steps ? (
            <div>
              <h2 className="font-heading text-2xl">{copy.stepsTitle}</h2>
              <ol className="mt-4 grid list-decimal gap-2 pl-5 text-muted-foreground">
                {copy.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ) : null}
          {copy.uses ? (
            <div>
              <h2 className="font-heading text-2xl">What it is for</h2>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-muted-foreground">
                {copy.uses.map((use) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
      <FaqList items={copy.faqs} title="Questions people ask" linkLabel="Open the tool" />
      <aside className="mt-14">
        <h2 className="font-heading text-2xl">Other tools</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} prefetch={false} className="punch-card block p-4">
                <p className="font-heading text-lg">{tool.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tool.does}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/en/pdf-tools/" prefetch={false} className="text-primary underline-offset-4 hover:underline">
            PDF tools
          </Link>
          {" · "}
          <Link href="/en/image-tools/" prefetch={false} className="text-primary underline-offset-4 hover:underline">
            Image tools
          </Link>
          {" · "}
          <Link href="/en/blog/" prefetch={false} className="text-primary underline-offset-4 hover:underline">
            Blog
          </Link>
        </p>
      </aside>
    </div>
  );
}
