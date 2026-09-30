const ITEMS = [
  "unir pdf",
  "juntar pdf",
  "comprimir pdf",
  "heic a jpg",
  "firmar pdf",
  "rellenar pdf",
  "editar pdf",
  "jpg a pdf",
  "sin subir el archivo",
  "en el navegador",
  "comprimir imagen",
  "pdf a jpg",
  "rotar pdf",
  "jpg a webp",
  "eliminar paginas pdf",
];

export function SearchTicker({
  reverse = false,
  tone = "yellow",
}: {
  reverse?: boolean;
  tone?: "yellow" | "orange";
}) {
  const line = ITEMS.join("  ·  ") + "  ·  ";
  return (
    <div
      className={`search-ticker no-print overflow-hidden border-b-2 border-foreground ${
        tone === "orange" ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
      }`}
    >
      <div
        className={`marquee-track flex w-max font-mono text-[0.7rem] font-medium tracking-[0.18em] uppercase ${
          reverse ? "reverse" : ""
        }`}
      >
        <span className="px-4 py-2">{line}</span>
        <span className="px-4 py-2" aria-hidden="true">
          {line}
        </span>
      </div>
    </div>
  );
}
