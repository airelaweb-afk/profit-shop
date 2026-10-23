import Link from "next/link";
import { Suspense } from "react";
import { ConsentControls } from "@/components/consent-controls";
import { CompareShell } from "@/components/compare-shell";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { LegalShell } from "@/components/legal-shell";
import { PlanCompareTable } from "@/components/plan-compare-table";
import { PluginDownload } from "@/components/plugin-download";
import { PricingBox } from "@/components/pricing-box";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import {
  enComparisons,
  enImageCards,
  enPdfCards,
  type EnPageSpec,
} from "@/lib/en-catalog";
import type { FaqItem } from "@/lib/faq";
import { FREE } from "@/lib/limits";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";
import { LEGAL, SITE_NAME, SITE_URL } from "@/lib/site";
import { hasCloud } from "@/lib/supabase";
import type { Competitor } from "@/lib/comparisons";

const cloud = hasCloud();

const open = "Open the tool";

export const enSiteFaqs: FaqItem[] = [
  {
    q: "Are my PDFs or photos uploaded to a server?",
    a: cloud
      ? "No. Merging, compressing, converting and signing happen in your browser: the file never leaves your device. The only thing we store in our database is your account (email, and whether you are Pro), so you can sign in from any device."
      : "No. Merging, compressing, converting and signing happen in this browser. The account also lives here (localStorage). If you change phones, you create the account again.",
  },
  {
    q: "Can I merge PDFs for free without uploading them?",
    a: "Yes. In Merge PDF you choose the files, put them in order and download one. No account needed. Free: 5 PDFs of 20 MB. Pro removes the cap.",
    href: "/en/merge-pdf/",
    linkLabel: open,
  },
  {
    q: "Why do you not convert PDF to Word?",
    a: "Without a layout engine on a server, the .docx comes out messy. We do not charge for an ugly Word file. Meanwhile you can merge, compress or sign the PDF.",
    href: "/en/blog/why-we-do-not-convert-pdf-to-word/",
    linkLabel: "Read the guide",
  },
  {
    q: "Can I fill the real boxes of a PDF?",
    a: "Yes, if the file has form fields (AcroForm). Fill PDF writes inside those boxes and the PDF stays a form. A scan or a flat PDF has no fields. Use Sign PDF and mark it on top.",
    href: "/en/fill-pdf/",
    linkLabel: open,
  },
  {
    q: "Can I change the text of a PDF that is not a form?",
    a: "Yes, in Edit PDF text, if the file has selectable letters. You tap the sentence, change it, and on save the old text is covered and the new text is written, reusing a TTF if the PDF had one. A scan is read with OCR in this browser. Check the result.",
    href: "/en/edit-pdf/",
    linkLabel: open,
  },
  {
    q: "Is this a qualified digital signature?",
    a: "No. It is your drawn signature, as on paper. It is fine for an informal form. It does not replace a qualified certificate.",
    href: "/en/sign-pdf/",
    linkLabel: open,
  },
  {
    q: "What is Pro?",
    a: "Pro removes the limits (files, size, daily tasks) and opens the watermark, batch WebP and the WordPress plugin. 7 € a month or 40 € a year. You pay with Stripe or Revolut.",
    href: "/en/pricing/",
    linkLabel: "See pricing",
  },
  {
    q: "Why do other converters' names appear?",
    a: "Because many people search for merge or compress PDF by typing the name of a known product. In Spain a comparison can be objective if we do not pretend to be them, we do not use their logo, and we do not name our product Alternative plus their brand. Ours is called Luna Oficio. The pages are under Comparisons.",
    href: "/en/compare/",
    linkLabel: "Open comparisons",
  },
  {
    q: "Do you use advertising cookies?",
    a: "No ads are loaded. Only necessary storage (session, consent and, if you turn Pro on, the key).",
    href: "/en/cookies/",
    linkLabel: "Cookie policy",
  },
  {
    q: "Can I remove a photo background without uploading it?",
    a: "Yes. In Remove background you choose an image and download a transparent PNG. The model downloads once onto your device. The photo does not leave. Fine hair, or a background the same colour as the clothes, can look uneven.",
    href: "/en/remove-background/",
    linkLabel: open,
  },
  {
    q: "My iPhone photo will not open on Windows. What do I do?",
    a: "It is HEIC. Convert it to JPG. The first time is slower because the decoder loads on this device.",
    href: "/en/heic-to-jpg/",
    linkLabel: open,
  },
  {
    q: "The PDF is 18 MB and Gmail cuts it off. How do I shrink it?",
    a: "Compress PDF: try Light (keeps the text) and, if it is still too big, Strong (pages become photos).",
    href: "/en/compress-pdf/",
    linkLabel: open,
  },
];

function BindingNote() {
  return (
    <p className="rounded-[2px] bg-accent px-4 py-3 text-sm text-foreground">
      The Spanish text is the binding version. Luna Oficio is run by a company in Spain, so the Spanish legal notice and privacy policy prevail if the two texts ever differ. This page is a translation for readers.
    </p>
  );
}

export function EnPdfCatalog() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">PDF</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        PDF tools. <span className="text-primary">Merge, compress, sign.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Merge, split, compress, JPG and PDF, fill fields, edit the text, sign, rotate, number pages and delete pages. The watermark is Pro. We do not convert to Word. The files stay here.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enPdfCards.map((tool) => (
          <li key={tool.en}>
            <ToolCard
              href={`${tool.en}/`}
              name={tool.name}
              problem={tool.problem}
              does={tool.does}
              pro={tool.pro}
              openLabel="Open"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EnImageCatalog() {
  const audio = [
    { href: "/en/audio-to-wav/", name: "Audio to WAV", does: "MP3, M4A, OGG or WebM to WAV." },
    { href: "/en/trim-audio/", name: "Trim audio", does: "Keep the seconds that matter." },
    { href: "/en/remove-background/", name: "Remove background", does: "A transparent PNG. The photo is not uploaded." },
  ];
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Images</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Image tools. <span className="text-primary">In your browser.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Compress, convert, resize, crop and rotate. Remove a background. Batch WebP is Pro. The photo is not uploaded.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enImageCards.map((tool) => (
          <li key={tool.en}>
            <ToolCard href={`${tool.en}/`} name={tool.name} problem={tool.problem} does={tool.does} pro={tool.pro} openLabel="Open" />
          </li>
        ))}
        {audio.map((tool) => (
          <li key={tool.href}>
            <ToolCard href={tool.href} name={tool.name} does={tool.does} openLabel="Open" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EnFaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <FaqJsonLd items={enSiteFaqs} />
      <p className="text-sm tracking-wide text-primary uppercase">FAQ</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        What people ask before they merge a PDF.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Files stay in the browser. What we do not do (PDF to Word, a qualified certificate). How Pro is paid.
      </p>
      <FaqList items={enSiteFaqs} title="Questions" linkLabel="Open" />
    </div>
  );
}

export function EnPricingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Pricing</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Free for today. Pro, with no cap.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The tools work without an account. The file is not uploaded. You pay on Stripe (card) or Revolut.
      </p>
      <ul className="mt-10 grid gap-4 lg:grid-cols-3">
        <li className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide text-primary uppercase">Free</p>
          <p className="mt-2 font-heading text-3xl">0 €</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>No account</li>
            <li>Merge up to {FREE.pdfFiles} PDFs of {FREE.pdfBytes / (1024 * 1024)} MB</li>
            <li>Up to {FREE.imageFiles} images per batch</li>
            <li>{FREE.jobsPerDay} tasks a day</li>
            <li>Sign, compress, HEIC to JPG, JPG to WebP</li>
            <li>Quotes and documents (short batches)</li>
          </ul>
        </li>
        <li className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide text-primary uppercase">Pro monthly</p>
          <p className="mt-2 font-heading text-3xl">{PRO_MONTHLY}<span className="text-lg"> / month</span></p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>No practical cap on files or size</li>
            <li>No daily cap</li>
            <li>PDF watermark</li>
            <li>WebP batch (a whole folder)</li>
            <li>WordPress WebP plugin</li>
            <li>Cancel when you want</li>
          </ul>
        </li>
        <li className="rounded-[2px] bg-accent p-5 text-accent-foreground ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide uppercase">Pro yearly</p>
          <p className="mt-2 font-heading text-3xl">{PRO_YEARLY}<span className="text-lg"> / year</span></p>
          <p className="mt-1 text-sm">3.33 € a month. You save 44 € against paying month by month.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Everything in the monthly plan, for 12 months</li>
            <li>{cloud ? "Works on every device you sign in on" : "A key in this browser"}</li>
            <li>{cloud ? `Turns on when you pay · ${LEGAL.email}` : `A local key · ${LEGAL.email}`}</li>
          </ul>
        </li>
      </ul>
      <PlanCompareTable showCta={false} embedded locale="en" />
      <div className="mt-8">
        <Suspense>
          <PricingBox locale="en" />
        </Suspense>
      </div>
    </div>
  );
}

export function EnHowPage() {
  const sections = [
    ["What “it does not exist” means", "Invoicing exists. Spreadsheets exist. What does not exist is the middle button: paste a list and leave with presentable papers, without setting the company up in a CRM. That is the search: make several quotes at once, not best management software."],
    ["AI for the words, not as the product", "AI is useful for writing and for varying examples. The tool has to do a calculation or a batch that a chat does badly: ten PDFs, ten amounts with VAT, ten different headers. If a chat already solves it in one message, it is not a product."],
    ["How it gets found", "Each tool is a page with a clear title. The person searching for the problem arrives, uses it for free, and already knows the value if they later want Pro."],
    ["No account to use them", "Merge, compress, sign and the rest work as soon as you open the page. Free has a cap (files, size, tasks a day). An account is only needed if you pay for Pro and want it on another device."],
    ["Merge and compress PDF", "The searches: join several PDFs, split pages, shrink the file, turn photos into a PDF or the other way around. It happens in this browser. We do not convert to Word."],
    ["Photos and audio", "Compress, PNG to JPG, iPhone HEIC, crop, rotate and remove the background. Also audio to WAV. AI upscaling, video and PDF to Word are not here."],
    ["Fill and sign a PDF", "You open the PDF they sent, zoom the page, tick boxes, type and sign. You take it with you. It does not leave the browser. It does not replace a qualified certificate."],
    ["If someone searched another name", "People who type a famous converter usually want to merge or compress a PDF. The product is called Luna Oficio. We do not use their logo. We compare one fact: the file stays in the browser. The pages are under Comparisons."],
  ];
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">The approach</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Things that are not a product, even though the problem is real.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A CRM asks for a calendar, clients, invoices and new habits. The person doing the paperwork wants, on Tuesday: ten quotes, these payments, these receipts for the accountant. That is not a CRM. It is a page.
      </p>
      <div className="mt-10 space-y-8">
        {sections.map(([title, text]) => (
          <section key={title}>
            <h2 className="font-heading text-2xl">{title}</h2>
            <p className="mt-2 text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button className="h-11 px-5" render={<Link href="/en/merge-pdf/" />} nativeButton={false}>
          Merge PDF
        </Button>
        <Button variant="outline" className="h-11 px-5" render={<Link href="/en/blog/" />} nativeButton={false}>
          Read the blog
        </Button>
      </div>
    </div>
  );
}

export function EnContactPage() {
  return (
    <LegalShell kicker="Contact" title="Write to us" locale="en">
      <p>
        Email: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Holder: {LEGAL.holder}.
      </p>
      <p>
        If a PDF will not open, say the file type and whether it has a password. Do not send the PDF with personal data if you can avoid it: processing happens in your browser.
      </p>
      <p>
        Pro key or a receipt: put “Pro” in the subject. Holder tax ID: {LEGAL.nif}.
      </p>
    </LegalShell>
  );
}

export function EnCompareIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Compare</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        People searching for a known converter land here. We are {SITE_NAME}.
      </h1>
      <p className="mt-4 text-muted-foreground">
        We name other brands only to identify them. We do not use their logos, and we do not present Luna Oficio as a product called Alternative plus their brand. The fact we compare is where the file is processed: uploaded, or kept on your device. The binding legal text is the Spanish legal notice.
      </p>
      <ul className="mt-10 grid gap-3">
        {enComparisons.map((item) => (
          <li key={item.slug}>
            <Link href={`${item.href}/`} className="punch-card block p-5">
              <p className="font-heading text-2xl">Compared with {item.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.meta}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EnCompareOne({ slug }: { slug: string }) {
  const item = enComparisons.find((entry) => entry.slug === slug);
  if (!item) return null;
  const asCompetitor = item as unknown as Competitor;
  const pool = enComparisons as unknown as Competitor[];
  return <CompareShell item={asCompetitor} locale="en" pool={pool} />;
}

const pluginFeatures = [
  ["Already WebP on upload", "Each JPG or PNG that enters the library is converted, with all of its thumbnails. You do not change how you work."],
  ["The whole library, in batches", "One button walks what you already uploaded, in small batches, with progress and a log. If it stops, it continues where it left off."],
  ["The URLs are updated", "Posts, pages and custom fields (serialized data or page-builder JSON) point at the .webp file."],
  ["You can go back", "By default the originals are kept. Restore originals undoes the conversion in one click, for one image or for all of them."],
  ["It never makes a file heavier", "If the WebP weighs more than the original (very simple PNGs), it leaves the file as it was. Quality is configurable. 82 is the default."],
  ["Only your server", "It uses your host GD or Imagick. No licence keys, and no images travelling to an external API."],
];

export function EnPluginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">WordPress plugin · Pro</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        The whole WordPress media library, as WebP.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        A light plugin that converts what you upload and, in batches, what you already had, including thumbnails, and rewrites the URLs so posts keep loading. Less weight, better PageSpeed, without paying an external API per image. Included in{" "}
        <Link href="/en/pricing/" className="text-primary underline-offset-4 hover:underline">
          Luna Oficio Pro
        </Link>
        .
      </p>
      <div className="mt-10">
        <Suspense>
          <PluginDownload locale="en" />
        </Suspense>
      </div>
      <section className="mt-14">
        <h2 className="font-heading text-2xl">What it does</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pluginFeatures.map(([title, text]) => (
            <li key={title} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <p className="font-heading text-xl">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function EnLegal({ kind }: { kind: EnPageSpec["kind"] }) {
  if (kind === "legal-notice") {
    return (
      <LegalShell kicker="Legal" title="Legal notice" locale="en">
        <BindingNote />
        <p>Last updated: {LEGAL.updated}.</p>
        <h2>Holder</h2>
        <p>
          {SITE_NAME} ({SITE_URL}) is published by {LEGAL.holder}. Email: {LEGAL.email}. Tax ID: {LEGAL.nif}. Address: {LEGAL.address}.
        </p>
        <h2>What the site is</h2>
        <p>
          Tools for files and documents (merge PDF, compress an image, convert to WebP, quotes, payment reminders, and so on). It is not a CRM, not a qualified signature, and not invoicing software.
        </p>
        <h2>Intellectual property</h2>
        <p>
          The text, marks and code of this site belong to {LEGAL.holder}, except third-party libraries under their own licence. You may use the tools for your work. You may not copy the whole site and sell it as your own.
        </p>
        <h2>Third-party brands</h2>
        <p>
          The name of this site is {SITE_NAME}. Comparison pages name other brands (iLovePDF, Smallpdf, PDF24, iLoveIMG, Adobe Acrobat, Sejda, PDF Candy, among others) only to identify the competitor. We do not use their logo, we do not suggest an affiliation, and we do not present our service as a product called Alternative plus their brand.
        </p>
        <p>
          In Spain that comparison is lawful when it is objective, about essential and verifiable features, and it does not mislead or disparage: article 10 of Act 3/1991 on unfair competition, Directive 2006/114/EC, Trademark Act 17/2001, and Supreme Court judgment 105/2016. The fact we contrast is where the file is processed.
        </p>
        <h2>Liability</h2>
        <p>
          The tools are offered as they are. A protected PDF, an unusual HEIC or a corrupt file can fail. Check the downloaded file before you send it. We are not liable for an administrative filing that was submitted wrongly.
        </p>
        <h2>Law</h2>
        <p>Spain. The courts of the holder, where that applies.</p>
      </LegalShell>
    );
  }
  if (kind === "privacy") {
    return (
      <LegalShell kicker="Legal" title="Privacy policy" locale="en">
        <BindingNote />
        <p>Last updated: {LEGAL.updated}.</p>
        <h2>Controller</h2>
        <p>{LEGAL.holder} · {LEGAL.email} · tax ID {LEGAL.nif}.</p>
        <h2>What data exists, and where</h2>
        {cloud ? (
          <>
            <p>
              <strong className="text-foreground">Files do not leave your browser.</strong> PDFs, photos, audio and quotes are processed and downloaded on your device. No server of ours receives them.
            </p>
            <p>
              If you create an account, we store email, name, signup date, last access and, if you pay for Pro, the method, amount and period. The password is stored as a hash. This data is in Supabase (European Union) as processor under the GDPR. Card payment is processed by Stripe. We do not see or store the card number.
            </p>
          </>
        ) : (
          <p>
            {SITE_NAME} has no database of ours. The account (name, email and a PBKDF2 hash of the password) is stored in this browser (localStorage). PDFs, photos and quotes are processed here and downloaded here. If you clear the site data or change phones, they are gone.
          </p>
        )}
        <h2>Purpose</h2>
        <p>
          {cloud
            ? "To identify you so the tools work on any device, to turn Pro on and keep it, and to answer you. Legal basis: the service you ask for (GDPR art. 6.1.b) and your consent for advertising if you accept it (art. 6.1.a). We keep the account while it is active, and payment data for as long as tax rules require."
            : "To identify you on this device so you can use the tools and, if you accept advertising, to show ads. Legal basis: your consent and the service you ask for by using the site (GDPR art. 6.1.a and b)."}
        </p>
        <h2>Sharing</h2>
        <p>
          We do not sell lists.
          {cloud ? " Processors: Supabase (account hosting, EU) and Stripe (payments). " : " "}
          If you turn on third-party advertising when it exists, those providers may process identifiers under their own policy. Until then we do not load external ad scripts.
        </p>
        <h2>Your rights</h2>
        <p>
          Access, rectification, erasure, objection, restriction and portability: email {LEGAL.email}. You can complain to the Spanish Data Protection Agency (AEPD).
        </p>
        <h2>Children</h2>
        <p>The site is not aimed at children under 14.</p>
        <p>
          More on cookies in the <Link href="/en/cookies/">cookie policy</Link>.
        </p>
      </LegalShell>
    );
  }
  if (kind === "cookies") {
    return (
      <LegalShell kicker="Legal" title="Cookie policy" locale="en">
        <BindingNote />
        <p>Last updated: {LEGAL.updated}.</p>
        <h2>What we use</h2>
        <p>We do not use classic server session cookies. We use storage in your browser:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Necessary:</strong> account, session, consent, Pro key. Without them the site does not remember that you signed in.
          </li>
          <li>
            <strong className="text-foreground">Advertising (optional):</strong> only if you tap Accept advertising. It would serve third-party ads when they are active. Today the ad slot is ours (Pro), not Google.
          </li>
        </ul>
        <h2>How to change it</h2>
        <p>You can change it here, without deleting the account. The choice is stored in this browser. Email: {LEGAL.email}.</p>
        <ConsentControls locale="en" />
        <p>
          Privacy: <Link href="/en/privacy/">privacy policy</Link>.
        </p>
      </LegalShell>
    );
  }
  return (
    <LegalShell kicker="Legal" title="Terms of use" locale="en">
      <BindingNote />
      <p>Last updated: {LEGAL.updated}.</p>
      <h2>Account</h2>
      <p>
        Creating an account means you accept these terms, the <Link href="/en/legal-notice/">legal notice</Link> and the <Link href="/en/privacy/">privacy policy</Link>.{" "}
        {cloud
          ? "The account is stored in our database (email, name and Pro status). The files you process are never uploaded. There is no SLA."
          : "The account is local: there is no SLA and no backup of ours."}
      </p>
      <h2>Free and Pro</h2>
      <p>
        The tools (merge PDF, compress, HEIC to JPG, and the rest) work without an account, with a cap on files and on tasks per day. Pro ({PRO_MONTHLY} a month or {PRO_YEARLY} a year) removes those limits and unlocks the watermark, batch WebP and the WordPress plugin. The plugin is licensed under GPL v2 or later. You can install it on the WordPress sites you administer. Payment is with Stripe (card) or Revolut.{" "}
        {cloud
          ? "When you pay, Pro turns on for your account and works on any device you sign in on."
          : "When you pay we send a key that you activate on Pricing. The key lives on this device."}{" "}
        See <Link href="/en/pricing/">Pricing</Link>.
      </p>
      <h2>What you must not do</h2>
      <p>Do not use the site for illegal material, to attack other systems, or to impersonate an official certificate. This is not a qualified electronic signature.</p>
      <h2>Tools we do not offer</h2>
      <p>PDF to Word, video, and MP3 output are not here. They are not charged for. Removing a background is here, and it runs in the browser. If a future tool needs a server, the page will say that the file travels.</p>
    </LegalShell>
  );
}
