import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";

export type EmbeddedFontFile = {
  name: string;
  bytes: Uint8Array;
};

function stripName(value: unknown) {
  return String(value || "")
    .replace(/^\//, "")
    .replace(/^.*\+/, "")
    .trim();
}

function bytesFromStream(doc: PDFDocument, ref: unknown): Uint8Array | null {
  if (!ref) return null;
  const stream = doc.context.lookup(ref as never);
  if (!(stream instanceof PDFRawStream)) return null;
  try {
    return decodePDFRawStream(stream).decode();
  } catch {
    return stream.getContents();
  }
}

function looksLikeOpenType(bytes: Uint8Array) {
  if (bytes.length < 4) return false;
  const ttf = bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0;
  const otf =
    bytes[0] === 0x4f &&
    bytes[1] === 0x54 &&
    bytes[2] === 0x54 &&
    bytes[3] === 0x4f;
  const woff = bytes[0] === 0x77 && bytes[1] === 0x4f && bytes[2] === 0x46;
  return ttf || otf || woff;
}

export function extractEmbeddedFonts(doc: PDFDocument): EmbeddedFontFile[] {
  const found: EmbeddedFontFile[] = [];
  const seen = new Set<string>();
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) continue;
    const bytes =
      bytesFromStream(doc, obj.get(PDFName.of("FontFile2"))) ||
      bytesFromStream(doc, obj.get(PDFName.of("FontFile3")));
    if (!bytes || !looksLikeOpenType(bytes)) continue;
    const name =
      stripName(obj.get(PDFName.of("FontName"))) ||
      stripName(obj.get(PDFName.of("BaseFont"))) ||
      `fuente-${found.length + 1}`;
    const key = `${name}:${bytes.byteLength}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ name, bytes });
  }
  return found;
}

export function pickEmbeddedFont(
  files: EmbeddedFontFile[],
  hint: string | undefined,
) {
  if (!files.length) return null;
  const needle = stripName(hint).toLowerCase();
  if (!needle) return files[0];
  return (
    files.find((file) => file.name.toLowerCase() === needle) ||
    files.find(
      (file) =>
        file.name.toLowerCase().includes(needle) ||
        needle.includes(file.name.toLowerCase()),
    ) ||
    files[0]
  );
}
