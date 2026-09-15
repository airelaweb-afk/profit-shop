import { cn } from "@/lib/utils";
import type { CoverStyle } from "@/lib/products";

const palettes: Record<
  CoverStyle,
  { bg: string; ink: string; accent: string; paper: string }
> = {
  planner: {
    bg: "#C45C26",
    ink: "#2A2118",
    accent: "#F4EBDD",
    paper: "#F7F0E4",
  },
  instagram: {
    bg: "#9A3B4A",
    ink: "#2A1518",
    accent: "#F3D5C8",
    paper: "#FBEFEA",
  },
  invoice: {
    bg: "#5C6B4A",
    ink: "#1E2418",
    accent: "#E4EBD3",
    paper: "#F3F4EA",
  },
  cv: {
    bg: "#3D4C63",
    ink: "#151B24",
    accent: "#D5DDEA",
    paper: "#EEF1F6",
  },
  calendar: {
    bg: "#B7812E",
    ink: "#2A2110",
    accent: "#F3E2C0",
    paper: "#F8F0DC",
  },
  brand: {
    bg: "#6B3A55",
    ink: "#24151E",
    accent: "#EAD3DE",
    paper: "#F6EAEE",
  },
  bundle: {
    bg: "#2A2118",
    ink: "#F4EBDD",
    accent: "#C45C26",
    paper: "#E7D3B8",
  },
  pricelist: {
    bg: "#2F6B62",
    ink: "#10221F",
    accent: "#D4EBE6",
    paper: "#EAF5F2",
  },
};

function PlannerArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="28" y="22" width="64" height="80" rx="4" fill={paper} />
      <rect x="34" y="30" width="28" height="8" rx="1" fill={ink} opacity="0.85" />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={34 + col * 13}
            y={46 + row * 10}
            width="10"
            height="7"
            rx="1"
            fill={row === 2 && col === 1 ? accent : ink}
            opacity={row === 2 && col === 1 ? 1 : 0.18}
          />
        )),
      )}
    </g>
  );
}

function InstagramArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="38" y="16" width="44" height="88" rx="8" fill={paper} />
      <circle cx="60" cy="26" r="3" fill={ink} opacity="0.35" />
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={44 + col * 18}
            y={36 + row * 18}
            width="15"
            height="15"
            rx="2"
            fill={row + col === 2 ? accent : ink}
            opacity={row + col === 2 ? 1 : 0.2}
          />
        )),
      )}
    </g>
  );
}

function InvoiceArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="26" y="20" width="68" height="84" rx="3" fill={paper} />
      <rect x="34" y="30" width="32" height="6" rx="1" fill={ink} opacity="0.8" />
      <rect x="34" y="42" width="52" height="3" fill={ink} opacity="0.15" />
      <rect x="34" y="50" width="52" height="3" fill={ink} opacity="0.15" />
      <rect x="34" y="58" width="40" height="3" fill={ink} opacity="0.15" />
      <rect x="34" y="78" width="24" height="14" rx="2" fill={accent} />
    </g>
  );
}

function CvArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="30" y="18" width="60" height="86" rx="3" fill={paper} />
      <circle cx="46" cy="36" r="8" fill={accent} />
      <rect x="58" y="30" width="24" height="4" fill={ink} opacity="0.8" />
      <rect x="58" y="38" width="18" height="3" fill={ink} opacity="0.25" />
      <rect x="38" y="54" width="44" height="3" fill={ink} opacity="0.2" />
      <rect x="38" y="62" width="44" height="3" fill={ink} opacity="0.2" />
      <rect x="38" y="70" width="30" height="3" fill={ink} opacity="0.2" />
    </g>
  );
}

function CalendarArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="24" y="24" width="72" height="72" rx="4" fill={paper} />
      <rect x="24" y="24" width="72" height="16" rx="4" fill={ink} />
      <rect x="24" y="36" width="72" height="4" fill={ink} />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={36 + col * 16}
            cy={56 + row * 14}
            r="3"
            fill={row === 1 && col === 2 ? accent : ink}
            opacity={row === 1 && col === 2 ? 1 : 0.25}
          />
        )),
      )}
    </g>
  );
}

function BrandArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="22" y="30" width="76" height="60" rx="6" fill={paper} />
      <circle cx="42" cy="60" r="12" fill={accent} />
      <circle cx="62" cy="60" r="12" fill={ink} opacity="0.55" />
      <circle cx="82" cy="60" r="12" fill={ink} opacity="0.2" />
    </g>
  );
}

function BundleArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="22" y="34" width="52" height="68" rx="3" fill={paper} transform="rotate(-8 48 68)" />
      <rect x="36" y="28" width="52" height="68" rx="3" fill={accent} />
      <rect x="48" y="22" width="52" height="68" rx="3" fill={paper} />
      <rect x="58" y="36" width="28" height="5" fill={ink} opacity="0.7" />
      <rect x="58" y="48" width="32" height="3" fill={ink} opacity="0.25" />
    </g>
  );
}

function PriceArt({ paper, ink, accent }: { paper: string; ink: string; accent: string }) {
  return (
    <g>
      <rect x="28" y="22" width="64" height="80" rx="5" fill={paper} />
      <rect x="36" y="34" width="48" height="16" rx="2" fill={accent} />
      <rect x="36" y="56" width="48" height="16" rx="2" fill={ink} opacity="0.12" />
      <rect x="36" y="78" width="48" height="16" rx="2" fill={ink} opacity="0.12" />
    </g>
  );
}

const arts: Record<CoverStyle, typeof PlannerArt> = {
  planner: PlannerArt,
  instagram: InstagramArt,
  invoice: InvoiceArt,
  cv: CvArt,
  calendar: CalendarArt,
  brand: BrandArt,
  bundle: BundleArt,
  pricelist: PriceArt,
};

export function ProductCover({
  style,
  title,
  className,
}: {
  style: CoverStyle;
  title: string;
  className?: string;
}) {
  const palette = palettes[style];
  const Art = arts[style];

  return (
    <div
      className={cn(
        "relative aspect-[4/5] overflow-hidden rounded-2xl",
        className,
      )}
      style={{ background: palette.bg }}
    >
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <Art paper={palette.paper} ink={palette.ink} accent={palette.accent} />
      </svg>
      {title ? (
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p
            className="font-heading text-lg leading-tight tracking-tight"
            style={{ color: palette.paper }}
          >
            {title}
          </p>
        </div>
      ) : null}
    </div>
  );
}
