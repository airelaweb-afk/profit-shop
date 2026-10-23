import type { FaqItem } from "@/lib/faq";

export type EnToolCopy = {
  path: string;
  metaTitle: string;
  meta: string;
  keywords: string[];
  kicker: string;
  name: string;
  slogan: string;
  lead: string;
  stepsTitle?: string;
  steps?: string[];
  uses?: string[];
  faqs: FaqItem[];
};

export const enTools = [
  {
    href: "/en/remove-background/",
    name: "Remove background",
    does: "A photo in, a transparent PNG out.",
  },
  {
    href: "/en/merge-pdf/",
    name: "Merge PDF",
    does: "Several PDFs into one, in the order you choose.",
  },
  {
    href: "/en/compress-pdf/",
    name: "Compress PDF",
    does: "Small enough to send by email.",
  },
  {
    href: "/en/heic-to-jpg/",
    name: "HEIC to JPG",
    does: "iPhone photos that Windows can open.",
  },
  {
    href: "/en/compress-image/",
    name: "Compress image",
    does: "Shrink a JPG, PNG or WebP.",
  },
] as const;

const openTool = "Open the tool";

export const enHomeFaqs: FaqItem[] = [
  {
    q: "Are my files uploaded?",
    a: "No. Merging, compressing, converting and removing a background all happen in your browser. The file stays on your device.",
  },
  {
    q: "Can I merge PDFs for free without uploading them?",
    a: "Yes. Choose the files, put them in order and download one PDF. No account. The free plan allows 5 PDFs of 20 MB. Pro removes the cap.",
    href: "/en/merge-pdf/",
    linkLabel: openTool,
  },
  {
    q: "Can I remove a background without uploading the photo?",
    a: "Yes. You download a transparent PNG. The model downloads once onto your device. The photo is not sent anywhere. Fine hair can look uneven.",
    href: "/en/remove-background/",
    linkLabel: openTool,
  },
  {
    q: "My iPhone photo will not open on Windows. What do I do?",
    a: "That file is HEIC. Convert it to JPG here. The first time is slower because the decoder loads on your device.",
    href: "/en/heic-to-jpg/",
    linkLabel: openTool,
  },
  {
    q: "The PDF is too big for email. How do I shrink it?",
    a: "Use Compress PDF. Light keeps the text. If it is still too big, Strong turns each page into a photo.",
    href: "/en/compress-pdf/",
    linkLabel: openTool,
  },
  {
    q: "Where are the other tools?",
    a: "PDF, images, audio, quotes, the blog and the legal pages are in English here. The Spanish pages stay at their original addresses.",
    href: "/en/pdf-tools/",
    linkLabel: "Open the PDF tools",
  },
];

export const enRemoveBackground: EnToolCopy = {
  path: "/en/remove-background",
  metaTitle: "Remove background free, without uploading the photo",
  meta: "Remove the background from a photo online and free. Download a transparent PNG. It runs in your browser, so the image is never uploaded.",
  keywords: [
    "remove background",
    "remove bg free",
    "transparent background png",
    "remove image background online",
  ],
  kicker: "Remove background · free",
  name: "Remove background",
  slogan: "The photo stays here.",
  lead: "One photo. You get a transparent PNG. The model downloads the first time onto this device; the image is not sent to a server. Fine hair can look uneven.",
  stepsTitle: "How to remove a background",
  steps: [
    "Tap Choose photo (or Take a photo on a phone): JPG, PNG, WebP or an iPhone HEIC.",
    "Wait a few seconds. The first time, the model downloads (about 4 MB) and stays on your device.",
    "Check the result on the checkerboard. The transparent part is what was removed.",
    "Tap Save PNG. The file has a transparent background, ready to place on another color or on a site.",
  ],
  uses: [
    "Product photos for a shop, eBay, Etsy or a marketplace.",
    "A scanned logo or stamp that has to sit on another background.",
    "Cut out a person for a poster, a slide or a card.",
    "A quick cutout without Photoshop and without installing anything.",
  ],
  faqs: [
    {
      q: "Is the photo uploaded anywhere?",
      a: "No. It is processed in this browser. The first time, the model downloads (about 4 MB plus the engine) and stays on the device.",
    },
    {
      q: "Why does the edge look odd?",
      a: "The model is small so a phone can run it. A product or a logo on a different background comes out well. Loose hair, and clothes the same color as the wall, less so.",
    },
    {
      q: "Can I remove the background from several photos at once?",
      a: "No. One photo at a time, so the phone does not run out of memory.",
    },
    {
      q: "Is removing the background free?",
      a: "Yes. No account and no watermark, with a size cap and a daily task cap. Pro removes the cap.",
    },
    {
      q: "What format do I download?",
      a: "A PNG with a transparent background. If you need a white background, place it on white in an editor.",
    },
    {
      q: "Does it work on a phone?",
      a: "Yes, on Android and iPhone, in the browser. You can take the photo now or pick one from the gallery, including HEIC.",
    },
  ],
};

export const enMergePdf: EnToolCopy = {
  path: "/en/merge-pdf",
  metaTitle: "Merge PDF free, without uploading the file",
  meta: "Join several PDFs into one in your browser. No account, and the file is never uploaded.",
  keywords: ["merge pdf", "combine pdf online", "join pdf free"],
  kicker: "Merge PDF · free",
  name: "Merge PDF",
  slogan: "On this device.",
  lead: "Choose two or more PDFs, put them in order and download one file. On a phone, tap Choose PDFs. Nothing is sent to a server. We don't turn it into Word: that comes out badly in the browser.",
  faqs: [
    {
      q: "How many PDFs can I join?",
      a: "Free: 5 PDFs of 20 MB. Pro removes that cap. If you have more, merge them in batches or switch to Pro.",
    },
    {
      q: "Does the order stay?",
      a: "The order of the list. Move a file up or down with the arrows before you merge.",
    },
  ],
};

export const enCompressPdf: EnToolCopy = {
  path: "/en/compress-pdf",
  metaTitle: "Compress PDF free, without uploading the file",
  meta: "Reduce a PDF in your browser so it fits in an email. No Adobe, and the file is never uploaded.",
  keywords: ["compress pdf", "reduce pdf size", "pdf too large"],
  kicker: "Compress PDF · free",
  name: "Compress PDF",
  slogan: "Small enough to email.",
  lead: "Light compression rewrites the file and keeps the text. Strong turns the pages into photos: it shrinks more, but you can no longer select the text. This is not Adobe's Ghostscript. For a scan or a bloated PDF it is usually enough.",
  faqs: [
    {
      q: "Does Light compression always shrink the file?",
      a: "No. If the PDF is already well made, it barely changes. Use Strong then.",
    },
    {
      q: "Can I select the text after Strong?",
      a: "No. Each page becomes a photo. Keep the original if you still need the text.",
    },
  ],
};

export const enHeic: EnToolCopy = {
  path: "/en/heic-to-jpg",
  metaTitle: "HEIC to JPG free, without uploading the photo",
  meta: "Turn iPhone HEIC photos into JPG in your browser. Windows and a lot of email apps cannot open HEIC. The file is not uploaded.",
  keywords: ["heic to jpg", "convert heic", "iphone photo to jpg"],
  kicker: "HEIC to JPG · free",
  name: "HEIC to JPG",
  slogan: "The iPhone photo, as a JPG.",
  lead: "Windows and a lot of email apps cannot open HEIC. Convert it here. The first time takes a moment: the decoder loads on this device.",
  faqs: [
    {
      q: "Does it work on an iPhone?",
      a: "Yes. Choose the photos from the camera roll. On iOS, saving opens the share sheet: choose Save to Files.",
    },
  ],
};

export const enCompressImage: EnToolCopy = {
  path: "/en/compress-image",
  metaTitle: "Compress images free, without uploading the file",
  meta: "Shrink a JPG, PNG or WebP in your browser. The photo is not uploaded to a server. Useful for forms and websites.",
  keywords: ["compress image", "reduce jpg size", "compress photo"],
  kicker: "Compress image · free",
  name: "Compress image",
  slogan: "Small enough for the form.",
  lead: "Lower the JPG or WebP quality and download the result. A PNG sometimes will not shrink until you save it as JPG. AI upscaling is not here: that needs a server.",
  faqs: [
    {
      q: "Will a PNG always get smaller?",
      a: "Not always. A simple PNG can refuse to shrink. Saving it as JPG usually does, and the transparent areas become white.",
    },
  ],
};
