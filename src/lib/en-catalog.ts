import type { FaqItem } from "@/lib/faq";
import type { EnToolCopy } from "@/lib/en-copy";

export type EnKind =
  | "pdf"
  | "image"
  | "extra"
  | "audio"
  | "sign"
  | "fill"
  | "edit"
  | "webp"
  | "quotes"
  | "versions"
  | "reminders"
  | "timesheet"
  | "expenses"
  | "plugin"
  | "pdf-catalog"
  | "image-catalog"
  | "faq"
  | "pricing"
  | "how"
  | "contact"
  | "compare"
  | "compare-one"
  | "legal-notice"
  | "privacy"
  | "cookies"
  | "terms";

export type EnPageSpec = {
  es: string;
  en: string;
  slug: string;
  kind: EnKind;
  tool?: string;
  competitor?: string;
  name: string;
  does: string;
  problem?: string;
  pro?: boolean;
  copy?: EnToolCopy;
};

function page(
  spec: Omit<EnPageSpec, "slug" | "copy"> & {
    copy?: Omit<EnToolCopy, "path">;
  },
): EnPageSpec {
  const slug = spec.en.replace(/^\/en\//, "");
  return {
    ...spec,
    slug,
    copy: spec.copy ? { ...spec.copy, path: spec.en } : undefined,
  };
}

const toolFaqs = (items: [string, string][]): FaqItem[] =>
  items.map(([q, a]) => ({ q, a }));

export const enPages: EnPageSpec[] = [
  page({
    es: "/dividir-pdf",
    en: "/en/split-pdf",
    kind: "pdf",
    tool: "split",
    name: "Split PDF",
    does: "A page range, or one PDF per page.",
    problem: "The file has 40 pages and you only need three.",
    copy: {
      metaTitle: "Split PDF free, without uploading the file",
      meta: "Extract pages from a PDF, or save one PDF per page, in your browser. The file is never uploaded.",
      keywords: ["split pdf", "extract pdf pages", "separate pdf pages"],
      kicker: "Split PDF · free",
      name: "Split PDF",
      slogan: "Only the pages you need.",
      lead: "Type a range such as 1-3, 5, or save one PDF per page in a zip. The original stays on this device.",
      faqs: toolFaqs([
        ["Can I extract a range?", "Yes. 1-3, 5 keeps those pages in one PDF. Leave the box empty to keep every page."],
        ["Can I get one file per page?", "Yes. Tick one PDF per page and you download a zip."],
        ["Is the file uploaded?", "No. Splitting runs in this browser."],
      ]),
    },
  }),
  page({
    es: "/jpg-a-pdf",
    en: "/en/jpg-to-pdf",
    kind: "pdf",
    tool: "images",
    name: "JPG to PDF",
    does: "Several photos, one A4 PDF.",
    problem: "You have ID photos or receipts and they want a PDF.",
    copy: {
      metaTitle: "JPG to PDF free, without uploading the photos",
      meta: "Turn JPG or PNG photos into one A4 PDF in your browser. Useful for an ID card, receipts and screenshots.",
      keywords: ["jpg to pdf", "photo to pdf", "images to pdf"],
      kicker: "JPG to PDF · free",
      name: "JPG to PDF",
      slogan: "Photos on A4 pages.",
      lead: "Put the photos in order and download one PDF. On a phone you can take the picture now. This does not run OCR: the PDF holds the photos, which is what most forms ask for.",
      faqs: toolFaqs([
        ["Does it turn the photo into editable text?", "No. Each image sits on an A4 page. That is what most offices want."],
        ["Which formats?", "JPG and PNG. Put them in the order you want with the arrows."],
      ]),
    },
  }),
  page({
    es: "/pdf-a-jpg",
    en: "/en/pdf-to-jpg",
    kind: "pdf",
    tool: "to-images",
    name: "PDF to JPG",
    does: "Each page as a JPG, in a zip.",
    problem: "You need each page as a photo for WhatsApp.",
    copy: {
      metaTitle: "PDF to JPG free, without uploading the file",
      meta: "Save each PDF page as a JPG in a zip. It runs in your browser, so the file is never uploaded.",
      keywords: ["pdf to jpg", "pdf to image", "convert pdf pages to jpg"],
      kicker: "PDF to JPG · free",
      name: "PDF to JPG",
      slogan: "One photo per page.",
      lead: "Each page becomes a JPG inside a zip. It is a picture of the page, not editable text. A long file is slower on a phone: split a range first if you only need a few pages.",
      faqs: toolFaqs([
        ["Is this OCR?", "No. You get a photo of each page, which is what a chat group usually wants."],
        ["Where do the files go?", "Into one zip. On a phone, save it to Files and then share the photos."],
      ]),
    },
  }),
  page({
    es: "/pdf",
    en: "/en/sign-pdf",
    kind: "sign",
    name: "Sign PDF",
    does: "Tick boxes, type, sign and download.",
    problem: "Someone sent a PDF and you do not have Adobe.",
    copy: {
      metaTitle: "Sign a PDF free, without uploading the file",
      meta: "Tick boxes, type and draw a signature on a PDF in your browser. This is not a qualified digital certificate. The file is never uploaded.",
      keywords: ["sign pdf", "sign pdf online", "fill and sign pdf"],
      kicker: "Sign PDF · free",
      name: "Sign PDF",
      slogan: "Your signature, on this device.",
      lead: "Open the PDF they sent you, tick boxes, type and draw a signature. It stays in this browser. This is a drawn signature, like on paper. It does not replace a qualified certificate.",
      faqs: toolFaqs([
        ["Is this a qualified electronic signature?", "No. It is your drawn signature, as on paper. It is fine for an informal form. It does not replace a government certificate."],
        ["What if the PDF has real form fields?", "Fill them in the list on the side. They are written into the original fields. A scan has no fields: mark it on top instead."],
        ["Is the file uploaded?", "No. Signing runs in this browser."],
      ]),
    },
  }),
  page({
    es: "/rellenar-pdf",
    en: "/en/fill-pdf",
    kind: "fill",
    name: "Fill PDF",
    does: "Type into the original form fields.",
    problem: "The PDF already has boxes and you do not want to write on top.",
    copy: {
      metaTitle: "Fill a PDF form free, without uploading the file",
      meta: "Fill the original fields of a PDF form in your browser. A scan has no fields. The file is never uploaded.",
      keywords: ["fill pdf", "fill pdf form", "pdf form filler"],
      kicker: "Fill PDF · free",
      name: "Fill PDF",
      slogan: "The original boxes.",
      lead: "If the PDF has real form fields, you type inside them and the file stays a form. A scan or a flat PDF has no fields. Use Sign PDF and mark it on top.",
      faqs: toolFaqs([
        ["Why are there no boxes?", "The file has no AcroForm fields. A scan cannot grow fields by itself. Sign PDF lets you write on top."],
        ["Do the answers stay in the form?", "Yes. They are saved in the original fields, not painted over the page."],
      ]),
    },
  }),
  page({
    es: "/editar-pdf",
    en: "/en/edit-pdf",
    kind: "edit",
    name: "Edit PDF text",
    does: "Change a sentence on the page. A scan is read with OCR here.",
    problem: "The poster or the contract is not a form and you need to change one line.",
    copy: {
      metaTitle: "Edit PDF text free, without uploading the file",
      meta: "Change selectable text in a PDF in your browser. A scan is read with OCR on your device. The file is never uploaded.",
      keywords: ["edit pdf", "edit pdf text", "change text in pdf"],
      kicker: "Edit PDF · free",
      name: "Edit PDF text",
      slogan: "Change the sentence.",
      lead: "Tap a line, change it and save. The old text is covered and the new text is written, reusing an embedded TTF when the PDF has one. A scan is read with OCR in this browser: check the result.",
      faqs: toolFaqs([
        ["Does it work on a scan?", "Yes, with OCR in this browser, page by page. Read the result before you send it."],
        ["Will the font match?", "If the PDF embeds a TTF, that font is reused. Otherwise the new text is Helvetica."],
        ["Is this PDF to Word?", "No. You edit the PDF itself. We do not convert it to Word."],
      ]),
    },
  }),
  page({
    es: "/rotar-pdf",
    en: "/en/rotate-pdf",
    kind: "extra",
    tool: "rotate",
    name: "Rotate PDF",
    does: "Turn every page 90, 180 or 270 degrees.",
    problem: "The scan came out sideways.",
    copy: {
      metaTitle: "Rotate PDF free, without uploading the file",
      meta: "Rotate every page of a PDF 90, 180 or 270 degrees in your browser. No Adobe, and the file is never uploaded.",
      keywords: ["rotate pdf", "turn pdf pages", "sideways pdf"],
      kicker: "Rotate PDF · free",
      name: "Rotate PDF",
      slogan: "Every page, the right way up.",
      lead: "Pick 90, 180 or 270 degrees and download. Every page turns together. A single photo that is sideways belongs in Rotate image.",
      faqs: toolFaqs([
        ["Does it rotate one page only?", "No. Every page turns by the same angle."],
        ["Is the file uploaded?", "No. It stays in this browser."],
      ]),
    },
  }),
  page({
    es: "/numerar-pdf",
    en: "/en/number-pdf",
    kind: "extra",
    tool: "numbers",
    name: "Number PDF pages",
    does: "Put the page number in the footer, in this browser.",
    problem: "The contract has no page numbers.",
    copy: {
      metaTitle: "Number PDF pages free, without uploading the file",
      meta: "Add a page number to the footer of each page in your browser. The file is never uploaded.",
      keywords: ["number pdf pages", "add page numbers to pdf"],
      kicker: "Number PDF · free",
      name: "Number PDF pages",
      slogan: "So nobody gets lost.",
      lead: "The number is drawn in the footer, centred. Start at 1, or at another number if this file is an annex. It does not move the existing text: check a low footer before you send it.",
      faqs: toolFaqs([
        ["Can I start at a number other than 1?", "Yes. Type the first number. An annex can start at 12."],
        ["Does it rewrite the document?", "No. It draws the number on top, at the bottom of each page."],
      ]),
    },
  }),
  page({
    es: "/eliminar-paginas-pdf",
    en: "/en/delete-pdf-pages",
    kind: "extra",
    tool: "remove",
    name: "Delete PDF pages",
    does: "Type the pages to drop (2, 5-7) and download a clean PDF.",
    problem: "The blank cover and two middle pages have to go.",
    copy: {
      metaTitle: "Delete PDF pages free, without uploading the file",
      meta: "Remove pages from a PDF in your browser. Type 2, 5-7 and download the rest, in the same order. The file is never uploaded.",
      keywords: ["delete pdf pages", "remove pages from pdf"],
      kicker: "Delete PDF pages · free",
      name: "Delete PDF pages",
      slogan: "Drop the pages you do not need.",
      lead: "Type the pages to remove, separated by commas. Ranges work: 2, 5-7. The other pages stay in order.",
      faqs: toolFaqs([
        ["Can I delete a range?", "Yes. 5-7 removes pages 5, 6 and 7."],
        ["What if I delete every page?", "The tool stops. Leave at least one page."],
      ]),
    },
  }),
  page({
    es: "/marca-de-agua-pdf",
    en: "/en/watermark-pdf",
    kind: "extra",
    tool: "watermark",
    name: "PDF watermark",
    does: "Diagonal text on every page. A Pro tool.",
    problem: "You want DRAFT or CONFIDENTIAL across the page.",
    pro: true,
    copy: {
      metaTitle: "PDF watermark, without uploading the file",
      meta: "Stamp DRAFT or CONFIDENTIAL on every page of a PDF in your browser. Pro. The file is never uploaded.",
      keywords: ["pdf watermark", "draft watermark pdf", "confidential pdf stamp"],
      kicker: "PDF watermark · Pro",
      name: "PDF watermark",
      slogan: "DRAFT, on every page.",
      lead: "Diagonal text on each page, drawn on this device. Pro unlocks it. Merging, compressing and signing stay free.",
      faqs: toolFaqs([
        ["Is the watermark free?", "No. It is a Pro tool. The free tools stay free."],
        ["Does the file leave this browser?", "No. The text is drawn here."],
      ]),
    },
  }),
  page({
    es: "/png-a-jpg",
    en: "/en/png-to-jpg",
    kind: "image",
    tool: "to-jpg",
    name: "PNG to JPG",
    does: "PNG, WebP or HEIC to JPG. Transparency becomes white.",
    problem: "They asked for a JPG and you have a PNG.",
    copy: {
      metaTitle: "PNG to JPG free, without uploading the file",
      meta: "Convert a PNG, WebP or HEIC to JPG in your browser. Transparent areas become white. The file is never uploaded.",
      keywords: ["png to jpg", "convert png to jpg", "webp to jpg"],
      kicker: "PNG to JPG · free",
      name: "PNG to JPG",
      slogan: "A JPG they can open.",
      lead: "Transparent pixels are filled with white. If you still need the empty background, keep the PNG. JPG has no transparency.",
      faqs: toolFaqs([
        ["What happens to transparency?", "It becomes white. That is what most shops want for a product photo."],
        ["Can I convert several?", "Yes. They download together when there is more than one."],
      ]),
    },
  }),
  page({
    es: "/jpg-a-png",
    en: "/en/jpg-to-png",
    kind: "image",
    tool: "to-png",
    name: "JPG to PNG",
    does: "JPG, WebP or HEIC to PNG, here.",
    problem: "You need a PNG for a layout or a stamp.",
    copy: {
      metaTitle: "JPG to PNG free, without uploading the file",
      meta: "Convert a JPG, WebP or HEIC to PNG in your browser. The file is never uploaded.",
      keywords: ["jpg to png", "convert jpg to png"],
      kicker: "JPG to PNG · free",
      name: "JPG to PNG",
      slogan: "A PNG for the layout.",
      lead: "JPG, WebP or an iPhone HEIC becomes a PNG on this device. A JPG has no transparent background to recover.",
      faqs: toolFaqs([
        ["Will the background become transparent?", "No. A JPG has no transparency. Use Remove background if you need a cutout."],
      ]),
    },
  }),
  page({
    es: "/jpg-a-webp",
    en: "/en/jpg-to-webp",
    kind: "image",
    tool: "to-webp",
    name: "JPG to WebP",
    does: "JPG, PNG or HEIC to WebP, without uploading.",
    problem: "The site wants WebP so the page weighs less.",
    copy: {
      metaTitle: "JPG to WebP free, without uploading the file",
      meta: "Convert JPG or PNG to WebP in your browser. WebP is usually smaller. The file is never uploaded.",
      keywords: ["jpg to webp", "convert to webp", "png to webp"],
      kicker: "JPG to WebP · free",
      name: "JPG to WebP",
      slogan: "Lighter pages.",
      lead: "WebP is usually smaller at the same look. Some old email apps cannot open it. Use JPG for email, WebP for a website.",
      faqs: toolFaqs([
        ["Should I email a WebP?", "Often no. Outlook and some older apps fail. Convert to JPG for email."],
        ["Is the file uploaded?", "No. Conversion runs in this browser."],
      ]),
    },
  }),
  page({
    es: "/redimensionar-imagen",
    en: "/en/resize-image",
    kind: "image",
    tool: "resize",
    name: "Resize image",
    does: "Set the width or the height. The ratio stays.",
    problem: "The avatar wants 400 px and the photo is huge.",
    copy: {
      metaTitle: "Resize an image free, without uploading the file",
      meta: "Change the pixel size of a photo in your browser and keep the ratio. The file is never uploaded. No AI upscaling.",
      keywords: ["resize image", "resize photo", "change image size"],
      kicker: "Resize image · free",
      name: "Resize image",
      slogan: "The pixels they asked for.",
      lead: "Set the width or the height. The other side follows, unless you unlock the ratio. Making a small photo huge looks blurry. We do not pretend to upscale with AI.",
      faqs: toolFaqs([
        ["Is resizing the same as compressing?", "No. Resizing changes the pixels. If it is still too heavy, compress it after."],
        ["Can I enlarge a photo?", "You can type a larger size. It will look soft. Real upscaling needs a server, and this page does not do that."],
      ]),
    },
  }),
  page({
    es: "/recortar-imagen",
    en: "/en/crop-image",
    kind: "image",
    tool: "crop",
    name: "Crop image",
    does: "Draw the box and download the photo.",
    problem: "The edges have to go, or only the ID card should remain.",
    copy: {
      metaTitle: "Crop an image free, without uploading the file",
      meta: "Crop a JPG or PNG in your browser. Draw the box around an ID card, a receipt or a screenshot. The file is never uploaded.",
      keywords: ["crop image", "crop photo", "crop jpg online"],
      kicker: "Crop image · free",
      name: "Crop image",
      slogan: "Only the part that matters.",
      lead: "Drag a new box. Tap inside the box to move it. The page does not scroll while you drag. On a phone, crop first, then resize or compress if a form has a size limit.",
      faqs: toolFaqs([
        ["Does the page jump while I drag?", "No. The crop area keeps the touch on the photo."],
        ["Can I crop several at once?", "No. One photo, so you can see the box."],
      ]),
    },
  }),
  page({
    es: "/girar-imagen",
    en: "/en/rotate-image",
    kind: "image",
    tool: "rotate",
    name: "Rotate image",
    does: "Turn 90 degrees and download. Several at once if you want.",
    problem: "The phone saved it sideways.",
    copy: {
      metaTitle: "Rotate an image free, without uploading the file",
      meta: "Rotate JPG or PNG photos 90, 180 or 270 degrees in your browser. Several at once. The file is never uploaded.",
      keywords: ["rotate image", "turn photo", "sideways photo"],
      kicker: "Rotate image · free",
      name: "Rotate image",
      slogan: "The right way up.",
      lead: "Pick 90, 180 or 270 degrees. Several photos at once. A whole PDF belongs in Rotate PDF.",
      faqs: toolFaqs([
        ["Can I rotate a PDF here?", "No. Use Rotate PDF for a document. This page is for photos."],
      ]),
    },
  }),
  page({
    es: "/webp-en-lote",
    en: "/en/webp-batch",
    kind: "webp",
    name: "WebP batch",
    does: "Hundreds of JPG and PNG files to WebP, with a max width and a zip. Pro.",
    problem: "A whole folder of site images has to become WebP.",
    pro: true,
    copy: {
      metaTitle: "Convert a folder to WebP, without uploading it",
      meta: "Convert hundreds of JPG and PNG files to WebP in your browser, with a maximum width and a zip. Pro. Nothing is uploaded.",
      keywords: ["batch webp", "convert folder to webp", "jpg to webp batch"],
      kicker: "WebP batch · Pro",
      name: "WebP batch",
      slogan: "The whole folder.",
      lead: "Drop a folder of images. They convert one by one in this browser and download as a zip. Pro unlocks the batch. A single photo can use JPG to WebP for free.",
      faqs: toolFaqs([
        ["Is a single photo free?", "Yes. JPG to WebP is free. The folder tool is Pro."],
        ["Are the images uploaded?", "No. Each file is converted on this device."],
      ]),
    },
  }),
  page({
    es: "/audio-a-wav",
    en: "/en/audio-to-wav",
    kind: "audio",
    tool: "to-wav",
    name: "Audio to WAV",
    does: "MP3, M4A, OGG or WebM to WAV, in this browser.",
    problem: "The office software only accepts WAV.",
    copy: {
      metaTitle: "Audio to WAV free, without uploading the file",
      meta: "Convert MP3, M4A, OGG or WebM to WAV in your browser. The audio is never uploaded. Encoding to MP3 is not available.",
      keywords: ["audio to wav", "mp3 to wav", "m4a to wav"],
      kicker: "Audio to WAV · free",
      name: "Audio to WAV",
      slogan: "A WAV they can open.",
      lead: "MP3, M4A, OGG or WebM becomes WAV on this device. We do not encode MP3, and we do not pull the audio out of a video.",
      faqs: toolFaqs([
        ["Can I get an MP3 back?", "No. The output is WAV. Encoding MP3 needs an engine we do not ship."],
        ["Can I convert a video?", "No. This reads an audio file, not an MP4."],
      ]),
    },
  }),
  page({
    es: "/recortar-audio",
    en: "/en/trim-audio",
    kind: "audio",
    tool: "trim",
    name: "Trim audio",
    does: "Mark the start and the end and download a WAV.",
    problem: "The voice note is three minutes and only twenty seconds matter.",
    copy: {
      metaTitle: "Trim audio free, without uploading the file",
      meta: "Cut a voice note to the seconds that matter and download a WAV. It runs in your browser. The audio is never uploaded.",
      keywords: ["trim audio", "cut voice note", "trim mp3"],
      kicker: "Trim audio · free",
      name: "Trim audio",
      slogan: "Only the seconds that matter.",
      lead: "Set the start and the end. You download a WAV. Extracting audio from a video is not here.",
      faqs: toolFaqs([
        ["What format do I download?", "WAV. The input can be MP3, M4A, OGG, WAV or WebM."],
        ["Is the audio uploaded?", "No. It is decoded on this device."],
      ]),
    },
  }),
  page({
    es: "/presupuestos",
    en: "/en/quotes",
    kind: "quotes",
    name: "Quotes",
    does: "One PDF per client, with your logo.",
    problem: "Ten quotes, the same job, different names.",
    copy: {
      metaTitle: "Batch quotes in PDF, in your browser",
      meta: "Paste a client list and download one PDF per client, with your logo. No CRM. The data stays in this browser.",
      keywords: ["batch quotes", "quote pdf", "several quotes at once"],
      kicker: "Quotes · free",
      name: "Quotes",
      slogan: "One PDF per client.",
      lead: "The site does not email the quote for you. You save the PDF, copy the message and attach it yourself. Amounts use euros. VAT is the percentage you type.",
      faqs: toolFaqs([
        ["Does this send the email?", "No. It prepares the PDF and the message. You attach the file."],
        ["Is this an invoice?", "No. It is a quote. It does not collect payment and it is not Spanish e-invoicing."],
        ["Where is the client list stored?", "In this browser. A new phone does not bring it along."],
      ]),
    },
  }),
  page({
    es: "/versiones",
    en: "/en/quote-versions",
    kind: "versions",
    name: "Quote versions",
    does: "Basic, recommended and urgent, in one PDF.",
    problem: "One client asked for a simpler option and a rush option.",
    copy: {
      metaTitle: "Quote versions in one PDF, in your browser",
      meta: "Send basic, recommended and rush options as one PDF. One client, several packages. No CRM.",
      keywords: ["quote options", "basic recommended quote", "quote versions pdf"],
      kicker: "Versions · free",
      name: "Quote versions",
      slogan: "Several options, one PDF.",
      lead: "One job, several packages, one PDF the client can read. If the same pack goes to ten people, use Quotes instead.",
      faqs: toolFaqs([
        ["When do I use the batch instead?", "When the same services go to many clients. Versions are for one client who wants choices."],
      ]),
    },
  }),
  page({
    es: "/cobros",
    en: "/en/payment-reminders",
    kind: "reminders",
    name: "Payment reminders",
    does: "A first, second or last note, ready to paste.",
    problem: "Someone has not paid and you want a calm message.",
    copy: {
      metaTitle: "Payment reminder messages, in your browser",
      meta: "Write a first, second or final payment reminder and open it in WhatsApp or email. The list stays in this browser.",
      keywords: ["payment reminder", "unpaid invoice message", "whatsapp payment reminder"],
      kicker: "Reminders · free",
      name: "Payment reminders",
      slogan: "A clear note, not a fight.",
      lead: "Paste who owes what, and since when. You get a calm message, a firmer one, or a last request. Nothing is sent until you send it.",
      faqs: toolFaqs([
        ["Does this chase the debt for me?", "No. It writes the message. You paste it into WhatsApp or email."],
        ["Is this a credit register?", "No. It is the text for today. The list stays in this browser."],
      ]),
    },
  }),
  page({
    es: "/horas",
    en: "/en/timesheet",
    kind: "timesheet",
    name: "Timesheet",
    does: "Paste the days, see the total, download a PDF.",
    problem: "Friday needs a simple list of hours, not a clock-in system.",
    copy: {
      metaTitle: "Timesheet PDF, in your browser",
      meta: "Paste what you did each day, see the total and download a PDF. Not a clock-in system. The list stays in this browser.",
      keywords: ["timesheet pdf", "hours report", "freelance timesheet"],
      kicker: "Timesheet · free",
      name: "Timesheet",
      slogan: "The hours, on one page.",
      lead: "One line per day: date, hours, what you did. Hours can be 3.5, 3h, 2:30 or 2h30. You save the PDF and attach it yourself.",
      faqs: toolFaqs([
        ["Is this a time clock?", "No. It is a paper for the client or the manager. It does not track attendance."],
      ]),
    },
  }),
  page({
    es: "/gastos",
    en: "/en/expenses",
    kind: "expenses",
    name: "Expenses",
    does: "Date, shop and amount. Base, VAT and total.",
    problem: "The accountant wants this month's receipts.",
    copy: {
      metaTitle: "Expense list with VAT, in your browser",
      meta: "Paste date, shop and amount. See the net, the VAT and the total, and download a PDF. The list stays in this browser.",
      keywords: ["expense list vat", "receipt list pdf", "expense report"],
      kicker: "Expenses · free",
      name: "Expenses",
      slogan: "Receipts, on one page.",
      lead: "One line per receipt. You get the net, the VAT and the total in a PDF for your accountant. This is not bookkeeping software and it does not file a tax return.",
      faqs: toolFaqs([
        ["Does this file the VAT return?", "No. It is a readable list. Your accountant still does the filing."],
      ]),
    },
  }),
  page({
    es: "/plugin-wordpress-webp",
    en: "/en/wordpress-webp",
    kind: "plugin",
    name: "WordPress WebP plugin",
    does: "Converts uploads and the media library to WebP. Pro.",
    problem: "The media library is heavy and PageSpeed complains.",
    pro: true,
  }),
  page({
    es: "/herramientas-pdf",
    en: "/en/pdf-tools",
    kind: "pdf-catalog",
    name: "PDF tools",
    does: "Merge, split, compress, sign, fill and edit.",
  }),
  page({
    es: "/herramientas-imagen",
    en: "/en/image-tools",
    kind: "image-catalog",
    name: "Image tools",
    does: "Compress, convert, resize, crop, rotate and remove a background.",
  }),
  page({
    es: "/faq",
    en: "/en/faq",
    kind: "faq",
    name: "FAQ",
    does: "Files, Word, Pro and cookies.",
  }),
  page({
    es: "/precios",
    en: "/en/pricing",
    kind: "pricing",
    name: "Pricing",
    does: "Free with a cap. Pro removes it.",
  }),
  page({
    es: "/como-funciona",
    en: "/en/how-it-works",
    kind: "how",
    name: "How it works",
    does: "Tools in the browser. No CRM.",
  }),
  page({
    es: "/contacto",
    en: "/en/contact",
    kind: "contact",
    name: "Contact",
    does: "Email. No 24-hour phone line.",
  }),
  page({
    es: "/comparar",
    en: "/en/compare",
    kind: "compare",
    name: "Comparisons",
    does: "Where the file is processed.",
  }),
  page({
    es: "/aviso-legal",
    en: "/en/legal-notice",
    kind: "legal-notice",
    name: "Legal notice",
    does: "Who runs the site.",
  }),
  page({
    es: "/privacidad",
    en: "/en/privacy",
    kind: "privacy",
    name: "Privacy",
    does: "Files stay in the browser.",
  }),
  page({
    es: "/cookies",
    en: "/en/cookies",
    kind: "cookies",
    name: "Cookies",
    does: "Necessary storage, optional ads.",
  }),
  page({
    es: "/condiciones",
    en: "/en/terms",
    kind: "terms",
    name: "Terms",
    does: "Free tools and Pro.",
  }),
];

export const enComparisons = [
  {
    slug: "ilovepdf",
    name: "iLovePDF",
    holder: "iLovePDF is a third-party brand. It is not ours.",
    href: "/en/vs-ilovepdf",
    es: "/alternativa-a-ilovepdf",
    search: "merge pdf, compress pdf, jpg to pdf",
    title: "Merge a PDF in the browser: an objective comparison with iLovePDF",
    meta: "Merge and compress a PDF in the browser, without uploading the file. An objective comparison with iLovePDF, a third-party brand. Luna Oficio is not affiliated.",
    keywords: ["merge pdf without uploading", "compress pdf in browser", "ilovepdf comparison"],
    facts: [
      { label: "Where the PDF is processed", ours: "In your browser, on this device.", theirs: "On their servers: the file goes over the internet." },
      { label: "Merge, compress, JPG and PDF", ours: "Yes, free and without an account (with a cap).", theirs: "Yes; the document is uploaded." },
      { label: "PDF to Word", ours: "No. Without a layout engine the .docx comes out badly, and we do not fake it.", theirs: "Yes, by uploading the file to their engine." },
      { label: "Account and data", ours: "localStorage. A new phone starts again.", theirs: "An account in their cloud." },
    ],
  },
  {
    slug: "smallpdf",
    name: "Smallpdf",
    holder: "Smallpdf is a third-party brand. It is not ours.",
    href: "/en/vs-smallpdf",
    es: "/alternativa-a-smallpdf",
    search: "compress pdf, merge pdf, sign pdf",
    title: "Compress a PDF in the browser: an objective comparison with Smallpdf",
    meta: "Compress and merge a PDF in the browser. An objective comparison with Smallpdf, a third-party brand. We are not affiliated.",
    keywords: ["compress pdf without uploading", "merge pdf in browser", "smallpdf comparison"],
    facts: [
      { label: "Where the PDF is processed", ours: "In your browser.", theirs: "In Smallpdf's cloud." },
      { label: "Limits and payment", ours: "Merge, compress and sign for free (with a cap). Pro is unlimited and adds a watermark, batch WebP and a WordPress plugin.", theirs: "A free plan with limits; a subscription for the rest." },
      { label: "PDF to Word", ours: "Not available. The page says so.", theirs: "Yes, on a server." },
    ],
  },
  {
    slug: "pdf24",
    name: "PDF24",
    holder: "PDF24 is a third-party brand. It is not ours.",
    href: "/en/vs-pdf24",
    es: "/alternativa-a-pdf24",
    search: "merge pdf, free pdf tools",
    title: "PDF tools in the browser: an objective comparison with PDF24",
    meta: "PDF tools that run in the browser, without uploading the file. An objective comparison with PDF24, a third-party brand.",
    keywords: ["pdf tools in browser", "merge pdf free", "pdf24 comparison"],
    facts: [
      { label: "Where it runs", ours: "Only this browser. Nothing is sent to a server of ours.", theirs: "Online tools and desktop tools; the online path uses the network." },
      { label: "Focus", ours: "What people search for: merge, compress, HEIC to JPG, WebP, and working PDFs.", theirs: "A wide conversion suite." },
      { label: "Language", ours: "English pages here, Spanish pages at the original URLs.", theirs: "General-purpose products." },
    ],
  },
  {
    slug: "iloveimg",
    name: "iLoveIMG",
    holder: "iLoveIMG is a third-party brand. It is not ours.",
    href: "/en/vs-iloveimg",
    es: "/alternativa-a-iloveimg",
    search: "compress image, heic to jpg, png to jpg",
    title: "Compress an image in the browser: an objective comparison with iLoveIMG",
    meta: "Compress a photo, convert HEIC to JPG and PNG to JPG in the browser. An objective comparison with iLoveIMG, a third-party brand. Luna Oficio is not affiliated.",
    keywords: ["compress image without uploading", "heic to jpg in browser", "iloveimg comparison"],
    facts: [
      { label: "Where the photo is processed", ours: "In your browser.", theirs: "On their servers." },
      { label: "iPhone HEIC", ours: "Yes, with a local decoder (the first time is slower).", theirs: "Conversion in the cloud." },
      { label: "Remove background", ours: "Yes, in your browser, with a local model. Fine hair can look uneven.", theirs: "Editing on their servers." },
    ],
  },
  {
    slug: "adobe-acrobat",
    name: "Adobe Acrobat",
    holder: "Adobe Acrobat is an Adobe brand. It is not ours.",
    href: "/en/vs-adobe-acrobat",
    es: "/alternativa-a-adobe-acrobat",
    search: "compress pdf, sign pdf, merge pdf",
    title: "Merge and compress a PDF without Adobe Acrobat",
    meta: "Merge, compress and sign a PDF in the browser, without installing Acrobat and without uploading the file. An objective comparison. We are not affiliated with Adobe.",
    keywords: ["merge pdf without adobe", "compress pdf without acrobat", "sign pdf without adobe"],
    facts: [
      { label: "Install", ours: "None. You open the page.", theirs: "A desktop program or an Adobe account." },
      { label: "Price of everyday use", ours: "Merge and compress for free (with a cap). Pro is 7 € a month or 40 € a year.", theirs: "An Adobe licence or subscription." },
      { label: "Professional PDF to Word", ours: "No. Without a layout engine it comes out badly, and we say so.", theirs: "Yes, in their ecosystem." },
    ],
  },
  {
    slug: "sejda",
    name: "Sejda",
    holder: "Sejda is a third-party brand. It is not ours.",
    href: "/en/vs-sejda",
    es: "/alternativa-a-sejda",
    search: "merge pdf, compress pdf, sign pdf",
    title: "Merge a PDF in the browser: an objective comparison with Sejda",
    meta: "Merge and compress a PDF on your device. An objective comparison with Sejda, a third-party brand. Not affiliated.",
    keywords: ["merge pdf in browser", "sejda comparison", "pdf without uploading"],
    facts: [
      { label: "Where the file runs", ours: "This browser.", theirs: "Their servers (with the limits of the free plan)." },
      { label: "Account", ours: "Local, on this device.", theirs: "An account on their site if you want more tasks." },
    ],
  },
  {
    slug: "pdf-candy",
    name: "PDF Candy",
    holder: "PDF Candy is a third-party brand. It is not ours.",
    href: "/en/vs-pdf-candy",
    es: "/alternativa-a-pdf-candy",
    search: "merge pdf, jpg to pdf, compress pdf",
    title: "Join PDFs without uploading them: an objective comparison with PDF Candy",
    meta: "Join and compress a PDF in the browser. An objective comparison with PDF Candy, a third-party brand.",
    keywords: ["join pdf without uploading", "pdf candy comparison", "pdf in the browser"],
    facts: [
      { label: "The file", ours: "It does not leave this device.", theirs: "It is sent to their online service." },
      { label: "Working documents", ours: "Also quotes, payment reminders, timesheets, expenses and HEIC to JPG.", theirs: "A general conversion suite." },
    ],
  },
] as const;

for (const item of enComparisons) {
  enPages.push(
    page({
      es: item.es,
      en: item.href,
      kind: "compare-one",
      competitor: item.slug,
      name: item.name,
      does: item.meta,
    }),
  );
}

export const enPagePairs = enPages.map((item) => ({ es: item.es, en: item.en }));

export function getEnPage(slug: string) {
  return enPages.find((item) => item.slug === slug);
}

export function enComparison(slug: string) {
  return enComparisons.find((item) => item.slug === slug);
}

export const enToolCards = enPages.filter((item) =>
  ["pdf", "image", "extra", "audio", "sign", "fill", "edit", "webp", "quotes", "versions", "reminders", "timesheet", "expenses"].includes(item.kind),
);

export const enPdfCards = enToolCards.filter((item) =>
  ["pdf", "extra", "sign", "fill", "edit"].includes(item.kind),
);

export const enImageCards = enToolCards.filter((item) => item.kind === "image" || item.kind === "webp");

const featured = new Set([
  "/en/remove-background",
  "/en/merge-pdf",
  "/en/compress-pdf",
  "/en/heic-to-jpg",
  "/en/compress-image",
]);

export const enMoreTools = [
  ...enToolCards.filter((item) => !featured.has(item.en)),
  enPages.find((item) => item.kind === "plugin")!,
].map((item) => ({
  href: `${item.en}/`,
  name: item.name,
  does: item.does,
  pro: Boolean(item.pro),
}));

export {
  enFooterLegal,
  enFooterTools,
  enHeaderLinks,
  enMoreLinks,
} from "@/lib/en-nav";
