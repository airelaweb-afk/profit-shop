import {
  blankIssuer,
  lineTotal,
  quoteTotals,
  type Issuer,
  type ServiceLine,
  sampleIssuer,
} from "./quotes";

export type JobClient = {
  company: string;
  contact: string;
  email: string;
};

export type JobPackage = {
  id: string;
  name: string;
  enabled: boolean;
  includes: string;
  lines: ServiceLine[];
};

export type VersionJob = {
  title: string;
  client: JobClient;
  issuer: Issuer;
  packages: JobPackage[];
  rush: boolean;
  rushPercent: number;
};

function emptyLine(id: string): ServiceLine {
  return { id, name: "", quantity: 1, price: 0 };
}

export const emptyVersionJob: VersionJob = {
  title: "",
  client: { company: "", contact: "", email: "" },
  issuer: { ...blankIssuer },
  rush: true,
  rushPercent: 30,
  packages: [
    {
      id: "pkg-basico",
      name: "Básico",
      enabled: true,
      includes: "",
      lines: [emptyLine("b1")],
    },
    {
      id: "pkg-recomendado",
      name: "Recomendado",
      enabled: true,
      includes: "",
      lines: [emptyLine("r1")],
    },
    {
      id: "pkg-completo",
      name: "Completo",
      enabled: true,
      includes: "",
      lines: [emptyLine("c1")],
    },
  ],
};

export const sampleVersionJob: VersionJob = {
  title: "Web de la tienda y ficha de producto",
  client: {
    company: "Taller Sur",
    contact: "Diego Paredes",
    email: "diego@tallersur.es",
  },
  issuer: sampleIssuer,
  rush: true,
  rushPercent: 30,
  packages: [
    {
      id: "pkg-basico",
      name: "Básico",
      enabled: true,
      includes: "Una página. Formulario de contacto. Textos que vosotros enviáis.",
      lines: [
        {
          id: "b1",
          name: "Diseño y montaje de una página",
          quantity: 1,
          price: 65000,
        },
      ],
    },
    {
      id: "pkg-recomendado",
      name: "Recomendado",
      enabled: true,
      includes:
        "Hasta 4 páginas. Formulario. Galería. Dos rondas de revisión. Textos básicos redactados.",
      lines: [
        {
          id: "r1",
          name: "Web de 4 páginas",
          quantity: 1,
          price: 140000,
        },
        {
          id: "r2",
          name: "Redacción de textos (4 fichas)",
          quantity: 1,
          price: 18000,
        },
      ],
    },
    {
      id: "pkg-completo",
      name: "Completo",
      enabled: true,
      includes:
        "Hasta 8 páginas. Catálogo sencillo. Formación de 1 hora. Tres rondas. Prioridad en el calendario.",
      lines: [
        {
          id: "c1",
          name: "Web de 8 páginas + catálogo",
          quantity: 1,
          price: 240000,
        },
        {
          id: "c2",
          name: "Formación de entrega (1 h)",
          quantity: 1,
          price: 9000,
        },
      ],
    },
  ],
};

export type BuiltVersion = {
  key: string;
  label: string;
  rush: boolean;
  includes: string;
  lines: ServiceLine[];
  subtotal: number;
  tax: number;
  total: number;
};

export function activeLines(pkg: JobPackage) {
  return pkg.lines.filter(
    (line) => line.name.trim() && line.price > 0 && line.quantity > 0,
  );
}

export function applyRush(lines: ServiceLine[], percent: number): ServiceLine[] {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const extra = Math.round((subtotal * Math.max(0, percent)) / 100);
  if (extra <= 0) return lines;
  return [
    ...lines,
    {
      id: "rush-line",
      name: `Recargo de urgencia (${percent}%)`,
      quantity: 1,
      price: extra,
    },
  ];
}

export function buildVersions(job: VersionJob): BuiltVersion[] {
  const built: BuiltVersion[] = [];
  for (const pkg of job.packages) {
    if (!pkg.enabled || !pkg.name.trim()) continue;
    const base = activeLines(pkg);
    if (base.length === 0) continue;
    const normal = quoteTotals(base, job.issuer.taxPercent);
    built.push({
      key: `${pkg.id}-normal`,
      label: pkg.name,
      rush: false,
      includes: pkg.includes,
      lines: base,
      ...normal,
    });
    if (job.rush) {
      const rushed = applyRush(base, job.rushPercent);
      const totals = quoteTotals(rushed, job.issuer.taxPercent);
      built.push({
        key: `${pkg.id}-rush`,
        label: `${pkg.name} · urgente`,
        rush: true,
        includes: pkg.includes,
        lines: rushed,
        ...totals,
      });
    }
  }
  return built.slice(0, 12);
}
