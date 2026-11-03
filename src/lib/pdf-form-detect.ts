/**
 * Detección de zonas rellenables en PDF "planos" (sin AcroForm):
 * líneas de escritura, casillas (cuadrados pequeños) y cajas de texto.
 * Usa la lista de operadores gráficos de PDF.js (user space, y hacia arriba)
 * cruzada con getTextContent para deducir la etiqueta de cada zona.
 */

type PdfjsPage = {
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[] }>;
  getTextContent: () => Promise<{
    items: Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
    }>;
  }>;
  view: number[];
};

export type FlatZoneKind = "text" | "check" | "area";

export type FlatZone = {
  id: string;
  pageIndex: number;
  kind: FlatZoneKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

type Matrix = [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function apply(matrix: Matrix, x: number, y: number) {
  return { x: matrix[0] * x + matrix[2] * y + matrix[4], y: matrix[1] * x + matrix[3] * y + matrix[5] };
}

type OpsMap = Record<string, number>;

function segmentsFromOps(
  fnArray: number[],
  argsArray: unknown[],
  OPS: OpsMap,
) {
  const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const rects: { x: number; y: number; w: number; h: number }[] = [];

  let ctm: Matrix = [...IDENTITY];
  const stack: Matrix[] = [];
  let current: { x: number; y: number } | null = null;

  const pushSegment = (x1: number, y1: number, x2: number, y2: number) => {
    const a = apply(ctm, x1, y1);
    const b = apply(ctm, x2, y2);
    segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  };
  const pushRect = (x: number, y: number, w: number, h: number) => {
    const a = apply(ctm, x, y);
    const b = apply(ctm, x + w, y + h);
    rects.push({
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y),
    });
  };

  // DrawOPS del worker de pdf.js v6: 0 moveTo, 1 lineTo, 2 curveTo,
  // 3 quadraticCurveTo, 4 closePath. Rectángulos = moveTo + 3 lineTo + close.
  const DRAW_MOVE_TO = 0;
  const DRAW_LINE_TO = 1;
  const DRAW_CURVE_TO = 2;
  const DRAW_QUAD_CURVE_TO = 3;
  const DRAW_CLOSE_PATH = 4;

  const handlePackedBuffer = (buffer: ArrayLike<number>) => {
    let start: { x: number; y: number } | null = null;
    let verts: { x: number; y: number }[] | null = null;
    let curved = false;
    for (let j = 0; j < buffer.length; ) {
      const op = buffer[j++];
      if (op === DRAW_MOVE_TO) {
        current = { x: buffer[j++], y: buffer[j++] };
        start = current;
        verts = [current];
        curved = false;
      } else if (op === DRAW_LINE_TO) {
        const x = buffer[j++];
        const y = buffer[j++];
        if (current) pushSegment(current.x, current.y, x, y);
        current = { x, y };
        verts?.push(current);
      } else if (op === DRAW_CURVE_TO) {
        j += 4;
        const x = buffer[j++];
        const y = buffer[j++];
        if (current) pushSegment(current.x, current.y, x, y);
        current = { x, y };
        curved = true;
      } else if (op === DRAW_QUAD_CURVE_TO) {
        j += 2;
        const x = buffer[j++];
        const y = buffer[j++];
        if (current) pushSegment(current.x, current.y, x, y);
        current = { x, y };
        curved = true;
      } else if (op === DRAW_CLOSE_PATH) {
        if (current && start) {
          pushSegment(current.x, current.y, start.x, start.y);
        }
        if (verts && !curved && verts.length === 4) {
          const xs = verts.map((v) => v.x);
          const ys = verts.map((v) => v.y);
          const x0 = Math.min(...xs);
          const x1 = Math.max(...xs);
          const y0 = Math.min(...ys);
          const y1 = Math.max(...ys);
          pushRect(x0, y0, x1 - x0, y1 - y0);
        }
        current = start;
      } else {
        break;
      }
    }
    current = null;
  };

  for (let i = 0; i < fnArray.length; i += 1) {
    const fn = fnArray[i];
    const args = argsArray[i] as unknown[];
    if (fn === OPS.save) {
      stack.push([...ctm]);
    } else if (fn === OPS.restore) {
      const prev = stack.pop();
      if (prev) ctm = prev;
    } else if (fn === OPS.transform) {
      const m = args as number[];
      if (m.length >= 6) {
        ctm = multiply(ctm, [m[0], m[1], m[2], m[3], m[4], m[5]]);
      }
    } else if (fn === OPS.constructPath) {
      // pdf.js v6: args = [paintOp, packedBuffers[], minMax?]
      const buffers = args[1];
      if (Array.isArray(buffers)) {
        for (const buffer of buffers) {
          if (buffer && typeof (buffer as ArrayLike<number>).length === "number") {
            handlePackedBuffer(buffer as ArrayLike<number>);
          }
        }
      }
    } else if (fn === OPS.moveTo) {
      const a = args as number[];
      current = { x: a[0], y: a[1] };
    } else if (fn === OPS.lineTo) {
      const a = args as number[];
      if (current) pushSegment(current.x, current.y, a[0], a[1]);
      current = { x: a[0], y: a[1] };
    } else if (fn === OPS.rectangle) {
      const a = args as number[];
      pushRect(a[0], a[1], a[2], a[3]);
      current = { x: a[0], y: a[1] };
    } else if (fn === OPS.closePath || fn === OPS.endPath) {
      current = null;
    }
  }
  return { segments, rects };
}

function isHorizontal(
  seg: { x1: number; y1: number; x2: number; y2: number },
) {
  const dx = Math.abs(seg.x2 - seg.x1);
  const dy = Math.abs(seg.y2 - seg.y1);
  return dx >= 18 && dy <= 1.2;
}

// Une rayitas punteadas/segmentadas en una línea continua (huecos <= ~5pt).
function mergeLines(
  segs: { x1: number; y1: number; x2: number; y2: number }[],
) {
  const sorted = [...segs].sort(
    (a, b) => (a.y1 + a.y2) / 2 - (b.y1 + b.y2) / 2,
  );
  const lines: { x: number; y: number; w: number }[] = [];
  for (const seg of sorted) {
    const x = Math.min(seg.x1, seg.x2);
    const w = Math.abs(seg.x2 - seg.x1);
    const y = (seg.y1 + seg.y2) / 2;
    const hit = lines.find(
      (line) => Math.abs(line.y - y) < 1.5 && x <= line.x + line.w + 5 && line.x <= x + w + 5,
    );
    if (hit) {
      const right = Math.max(hit.x + hit.w, x + w);
      hit.x = Math.min(hit.x, x);
      hit.w = right - hit.x;
    } else {
      lines.push({ x, y, w });
    }
  }
  return lines;
}

type ThinRect = { x: number; y: number; w: number; h: number };

/**
 * Los formularios vectoriales dibujan las cajas como 4 rectángulos finos
 * (`re`) en vez de un path cerrado. Junta dos lados horizontales y dos
 * verticales que coincidan y reconstruye la caja.
 */
function boxesFromSides(rects: ThinRect[]): ThinRect[] {
  const hSides = rects.filter((r) => r.h <= 2 && r.w >= 10);
  const vSides = rects.filter((r) => r.w <= 2 && r.h >= 4);
  const boxes: ThinRect[] = [];
  for (const bottom of hSides) {
    for (const top of hSides) {
      const gap = top.y - bottom.y;
      if (gap < 4 || gap > 170) continue;
      if (Math.abs(top.x - bottom.x) > 3 || Math.abs(top.w - bottom.w) > 4) continue;
      const left = bottom.x;
      const right = bottom.x + bottom.w;
      const hasLeft = vSides.some(
        (v) =>
          Math.abs(v.x - left) < 2.5 &&
          v.y <= bottom.y + 2 &&
          v.y + v.h >= top.y - 2,
      );
      const hasRight = vSides.some(
        (v) =>
          Math.abs(v.x - right) < 2.5 &&
          v.y <= bottom.y + 2 &&
          v.y + v.h >= top.y - 2,
      );
      if (!hasLeft || !hasRight) continue;
      const box = { x: left, y: bottom.y, w: bottom.w, h: gap };
      if (
        !boxes.some(
          (b) =>
            Math.abs(b.x - box.x) < 3 &&
            Math.abs(b.y - box.y) < 3 &&
            Math.abs(b.w - box.w) < 3 &&
            Math.abs(b.h - box.h) < 3,
        )
      ) {
        boxes.push(box);
      }
      break;
    }
  }
  return boxes;
}

const BOX_GLYPHS = /^(\u2610|\u25A1|\u274F|\uFFFD|\u25A2)$/;

type TextItem = { x: number; y: number; w: number; h: number; str: string };

function collectText(items: TextItem[]) {
  return items.filter((item) => item.str.trim().length > 0);
}

function labelForLine(
  line: { x: number; y: number; w: number },
  texts: TextItem[],
) {
  let best = "";
  let bestScore = Number.POSITIVE_INFINITY;
  for (const item of texts) {
    const sameRow = Math.abs(item.y - line.y) < 9;
    const leftEnd = line.x - (item.x + item.w);
    if (sameRow && leftEnd > -2 && leftEnd < 60) {
      const score = leftEnd;
      if (score < bestScore) {
        bestScore = score;
        best = item.str;
      }
      continue;
    }
    const above = item.y - line.y;
    const overlaps = item.x >= line.x - 4 && item.x <= line.x + line.w;
    if (above > 0 && above < 16 && overlaps) {
      const score = above + 30;
      if (score < bestScore) {
        bestScore = score;
        best = item.str;
      }
    }
  }
  return best.trim().replace(/[:.]+\s*$/, "").slice(0, 60);
}

function labelForBox(
  box: { x: number; y: number; w: number; h: number },
  texts: TextItem[],
) {
  let best = "";
  let bestScore = Number.POSITIVE_INFINITY;
  for (const item of texts) {
    const right = item.x - (box.x + box.w);
    const sameRow = item.y >= box.y - 2 && item.y <= box.y + box.h + 2;
    if (sameRow && right > -1 && right < 40) {
      if (right < bestScore) {
        bestScore = right;
        best = item.str;
      }
    }
  }
  return best.trim().replace(/[:.]+\s*$/, "").slice(0, 40);
}

function near(a: FlatZone, b: FlatZone) {
  return (
    a.kind === b.kind &&
    a.pageIndex === b.pageIndex &&
    Math.abs(a.x - b.x) < 4 &&
    Math.abs(a.y - b.y) < 4 &&
    Math.abs(a.width - b.width) < 4 &&
    Math.abs(a.height - b.height) < 4
  );
}

export function detectFlatZonesOnPage(params: {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  rects: { x: number; y: number; w: number; h: number }[];
  texts: TextItem[];
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
}): FlatZone[] {
  const { pageIndex, pageWidth, pageHeight } = params;
  const zones: FlatZone[] = [];

  // Cajas reconstruidas de lados finos + rects cerradas de verdad.
  const sideBoxes = boxesFromSides(params.rects);
  const boxes = [...sideBoxes, ...params.rects.filter((r) => r.h > 2 && r.w > 2)];

  // Margen izquierdo del contenido (líneas de borde de sección arrancan ahí).
  const xs = [...params.segments.map((s) => Math.min(s.x1, s.x2)), ...params.rects.map((r) => r.x)];
  const marginLeft = xs.length ? Math.min(...xs) : 0;

  const lines = mergeLines(params.segments.filter(isHorizontal));
  for (const line of lines) {
    if (line.w < 20) continue;
    // Línea de borde a todo lo ancho que empieza en el margen: separador.
    if (line.x <= marginLeft + 3 && line.w >= pageWidth * 0.75) continue;
    // Borde horizontal de una caja vectorial: la caja ya es zona; no duplicar.
    const isBoxEdge = boxes.some((rect) => {
      const onEdge =
        Math.abs(line.y - rect.y) < 2 || Math.abs(line.y - (rect.y + rect.h)) < 2;
      const insideX =
        line.x >= rect.x - 3 && line.x + line.w <= rect.x + rect.w + 3;
      return onEdge && insideX && rect.h <= 170 && rect.h >= 6;
    });
    if (isBoxEdge) continue;
    const zone: FlatZone = {
      id: `p${pageIndex}-l${zones.length}`,
      pageIndex,
      kind: "text",
      x: line.x,
      y: Math.min(pageHeight - 14, line.y + 0.5),
      width: line.w,
      height: Math.min(16, Math.max(11, pageHeight - line.y)),
      label: labelForLine(line, params.texts),
    };
    if (zone.width > pageWidth * 0.98) continue;
    zones.push(zone);
  }

  for (const rect of boxes) {
    const small =
      rect.w >= 5 && rect.w <= 26 && rect.h >= 5 && rect.h <= 26 && Math.abs(rect.w - rect.h) <= 8;
    if (small) {
      zones.push({
        id: `p${pageIndex}-c${zones.length}`,
        pageIndex,
        kind: "check",
        x: rect.x,
        y: rect.y,
        width: rect.w,
        height: rect.h,
        label: labelForBox({ x: rect.x, y: rect.y, w: rect.w, h: rect.h }, params.texts),
      });
      continue;
    }
    const wide = rect.w >= 40 && rect.h >= 8 && rect.h <= 170 && rect.w <= pageWidth * 0.98;
    if (wide) {
      zones.push({
        id: `p${pageIndex}-a${zones.length}`,
        pageIndex,
        kind: "area",
        x: rect.x + 2,
        y: rect.y + rect.h - Math.min(16, rect.h - 3),
        width: rect.w - 4,
        height: Math.min(16, rect.h - 3),
        label: labelForBox({ x: rect.x, y: rect.y, w: rect.w, h: rect.h }, params.texts),
      });
    }
  }

  // Casillas dibujadas como glifo de texto (□, ☐, …).
  for (const item of params.texts) {
    if (!BOX_GLYPHS.test(item.str.trim())) continue;
    zones.push({
      id: `p${pageIndex}-g${zones.length}`,
      pageIndex,
      kind: "check",
      x: item.x - 1,
      y: item.y - 1,
      width: Math.max(item.w, 9),
      height: Math.max(item.h, 9),
      label: labelForBox(
        { x: item.x - 1, y: item.y - 1, w: Math.max(item.w, 9), h: Math.max(item.h, 9) },
        params.texts,
      ),
    });
  }

  const deduped: FlatZone[] = [];
  for (const zone of zones) {
    if (
      zone.x < -1 ||
      zone.y < -1 ||
      zone.x + zone.width > pageWidth + 1 ||
      zone.y + zone.height > pageHeight + 1
    ) {
      continue;
    }
    if (!deduped.some((other) => near(other, zone))) deduped.push(zone);
  }

  deduped.sort((a, b) =>
    b.y + b.height !== a.y + a.height
      ? b.y + b.height - (a.y + a.height)
      : a.x - b.x,
  );
  deduped.forEach((zone, index) => {
    zone.id = `p${pageIndex}-z${index}`;
  });
  return deduped;
}

export function textItemsFromContent(content: {
  items: Array<
    | { str: string; transform: number[]; width: number; height: number }
    | { type: string }
  >;
}): TextItem[] {
  return collectText(
    content.items
      .filter(
        (item): item is {
          str: string;
          transform: number[];
          width: number;
          height: number;
        } => "str" in item,
      )
      .map((item) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        w: item.width || Math.max(4, item.str.length * (item.transform[0] || 8) * 0.5),
        h: Math.abs(item.transform[3]) || item.height || 10,
      })),
  );
}

export { segmentsFromOps };
export type { PdfjsPage, TextItem };
