import Link from "next/link";
import { ArrowRight, Combine, Eraser, Minimize2, Shrink, Smartphone } from "lucide-react";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { LogoMark } from "@/components/site-brand";
import { Button } from "@/components/ui/button";
import { enHomeFaqs, enTools } from "@/lib/en-copy";

export function EnHome() {
  return (
    <div>
      <FaqJsonLd items={enHomeFaqs} />
      <section className="relative overflow-hidden bg-foreground text-background">
        <div
          className="hero-stripe pointer-events-none absolute -inset-x-1/4 -top-1/3 h-[140%] opacity-20 mix-blend-screen"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -left-16 top-6 size-48 opacity-25" aria-hidden="true">
          <LogoMark className="size-full" />
        </div>
        <div
          className="spark-float pointer-events-none absolute right-[10%] top-10 size-12 rounded-full bg-accent"
          aria-hidden="true"
        />
        <div className="relative luna-wrap py-10 sm:py-14">
          <p className="stamp-mark inline-block border-2 border-accent px-3 py-1 font-mono text-[0.68rem] font-medium tracking-[0.2em] text-accent uppercase">
            Free · No account · Files stay here
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-4xl leading-[1.05] tracking-tight text-background sm:text-6xl">
            PDF and image tools. <span className="text-primary">In your browser.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-background/75">
            Merge a PDF, compress a file, remove a background, turn an iPhone HEIC
            photo into a JPG. The file is never uploaded.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 w-full px-6 sm:w-auto"
              render={<Link href="#tools" prefetch={false} />}
              nativeButton={false}
            >
              See the tools
              <ArrowRight />
            </Button>
            <Button
              size="lg"
              className="h-12 w-full border-2 border-accent bg-accent px-6 text-accent-foreground hover:bg-accent/90 sm:w-auto"
              render={<Link href="/en/merge-pdf/" prefetch={false} />}
              nativeButton={false}
            >
              Merge PDF
            </Button>
          </div>
        </div>
        <div className="signal-bar" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="bg-[#f7f4ee] pt-10 sm:pt-14">
        <div className="luna-wrap">
          <div className="relative overflow-hidden rounded-2xl border-2 border-foreground bg-primary text-primary-foreground shadow-[8px_8px_0_0_#12110f]">
            <div
              className="hero-stripe pointer-events-none absolute -inset-x-1/4 -top-1/2 h-[200%] opacity-15 mix-blend-multiply"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                <span className="spark-float flex size-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-accent">
                  <Eraser className="size-8" strokeWidth={2} />
                </span>
                <div>
                  <span className="new-glow inline-block rounded-full bg-accent px-3 py-1 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-accent-foreground uppercase">
                    New
                  </span>
                  <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
                    Remove an image background
                  </h2>
                  <p className="mt-2 max-w-xl text-primary-foreground/85">
                    Drop the photo and download a transparent PNG in seconds. It
                    runs in your browser: the image never leaves your device.
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="h-12 w-full shrink-0 border-2 border-foreground bg-foreground px-6 text-background hover:bg-foreground/90 md:w-auto"
                render={<Link href="/en/remove-background/" prefetch={false} />}
                nativeButton={false}
              >
                Remove background free
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div id="tools" className="scroll-mt-20 bg-[#f7f4ee] py-12 sm:py-16">
        <div className="luna-wrap">
          <h2 className="text-center font-heading text-3xl tracking-tight sm:text-5xl">
            Free tools, in your browser
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            No account. The file is not uploaded. Free with a cap; Pro removes it.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enTools.map((tool) => {
              const featured = tool.href === "/en/remove-background/";
              const Icon =
                tool.href === "/en/remove-background/"
                  ? Eraser
                  : tool.href === "/en/merge-pdf/"
                    ? Combine
                    : tool.href === "/en/compress-pdf/"
                      ? Minimize2
                      : tool.href === "/en/heic-to-jpg/"
                        ? Smartphone
                        : Shrink;
              return (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    prefetch={false}
                    className={`group flex h-full flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 ${
                      featured
                        ? "border-2 border-foreground bg-accent shadow-[6px_6px_0_0_#ff4b1a] hover:shadow-[8px_8px_0_0_#ff4b1a]"
                        : "border-foreground/10 bg-card shadow-sm hover:border-primary hover:shadow-[6px_6px_0_0_#ff4b1a]"
                    }`}
                  >
                    <span
                      className={`flex size-12 items-center justify-center rounded-xl ${
                        featured ? "bg-foreground text-accent" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="size-6" strokeWidth={2} />
                    </span>
                    <span className="mt-4 flex items-baseline gap-2">
                      <span className="font-heading text-xl leading-tight">{tool.name}</span>
                      {featured ? (
                        <span className="new-glow rounded-full bg-primary px-2 py-0.5 font-mono text-[0.6rem] font-semibold tracking-[0.14em] text-primary-foreground uppercase">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {tool.does}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/" prefetch={false} className="text-primary underline-offset-4 hover:underline">
              The rest of the tools are in Spanish
            </Link>
          </p>
        </div>
      </div>

      <section className="luna-wrap pb-16">
        <FaqList items={enHomeFaqs} title="Questions people ask" linkLabel="Open the tool" />
      </section>
    </div>
  );
}
