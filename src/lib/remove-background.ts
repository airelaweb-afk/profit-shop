import { isHeicFile, isImageFile, loadBitmap } from "@/lib/image-ops";

const MODEL_URL = "/models/u2netp.onnx";
const MODEL_SIZE = 320;
const MAX_EDGE = 1600;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

type OrtModule = typeof import("onnxruntime-web");
type Session = Awaited<ReturnType<OrtModule["InferenceSession"]["create"]>>;

let sessionPromise: Promise<Session> | null = null;

function wasmBase() {
  return new URL("/onnx/", window.location.origin).href;
}

async function loadOrt(): Promise<OrtModule> {
  const loaded = await import("onnxruntime-web");
  if (typeof loaded.InferenceSession?.create === "function") return loaded;
  const fallback = (loaded as { default?: OrtModule }).default;
  if (fallback && typeof fallback.InferenceSession?.create === "function") {
    return fallback;
  }
  throw new Error("Este navegador no pudo cargar el motor de la imagen.");
}

async function openSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await loadOrt();
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      ort.env.wasm.wasmPaths = wasmBase();
      ort.env.wasm.simd = true;
      try {
        return await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ["wasm"],
        });
      } catch {
        ort.env.wasm.simd = false;
        return await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: ["wasm"],
        });
      }
    })().catch((error) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

function fitCanvas(bitmap: ImageBitmap) {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Este navegador no puede pintar la foto.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return { canvas, ctx, width, height };
}

function modelInput(source: CanvasImageSource) {
  const canvas = document.createElement("canvas");
  canvas.width = MODEL_SIZE;
  canvas.height = MODEL_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Este navegador no puede leer la foto.");
  ctx.drawImage(source, 0, 0, MODEL_SIZE, MODEL_SIZE);
  const pixels = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE).data;
  const input = new Float32Array(3 * MODEL_SIZE * MODEL_SIZE);
  const plane = MODEL_SIZE * MODEL_SIZE;
  for (let i = 0; i < plane; i += 1) {
    const offset = i * 4;
    input[i] = (pixels[offset] / 255 - MEAN[0]) / STD[0];
    input[plane + i] = (pixels[offset + 1] / 255 - MEAN[1]) / STD[1];
    input[2 * plane + i] = (pixels[offset + 2] / 255 - MEAN[2]) / STD[2];
  }
  return input;
}

function maskValues(data: ArrayLike<number>) {
  const count = MODEL_SIZE * MODEL_SIZE;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  const start = data.length > count ? data.length - count : 0;
  for (let i = 0; i < count; i += 1) {
    const value = data[start + i];
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const span = max - min || 1;
  const gray = new Uint8ClampedArray(count);
  for (let i = 0; i < count; i += 1) {
    gray[i] = Math.round(((data[start + i] - min) / span) * 255);
  }
  return gray;
}

function alphaMask(gray: Uint8ClampedArray, width: number, height: number) {
  const small = document.createElement("canvas");
  small.width = MODEL_SIZE;
  small.height = MODEL_SIZE;
  const smallCtx = small.getContext("2d");
  if (!smallCtx) throw new Error("Este navegador no puede preparar el recorte.");
  const image = smallCtx.createImageData(MODEL_SIZE, MODEL_SIZE);
  for (let i = 0; i < gray.length; i += 1) {
    const offset = i * 4;
    image.data[offset] = gray[i];
    image.data[offset + 1] = gray[i];
    image.data[offset + 2] = gray[i];
    image.data[offset + 3] = 255;
  }
  smallCtx.putImageData(image, 0, 0);

  const big = document.createElement("canvas");
  big.width = width;
  big.height = height;
  const bigCtx = big.getContext("2d", { willReadFrequently: true });
  if (!bigCtx) throw new Error("Este navegador no puede preparar el recorte.");
  bigCtx.imageSmoothingEnabled = true;
  bigCtx.drawImage(small, 0, 0, width, height);
  return bigCtx.getImageData(0, 0, width, height).data;
}

export async function removeBackground(
  file: File,
  onStatus?: (status: string) => void,
) {
  if (!isImageFile(file) && !isHeicFile(file)) {
    throw new Error("Elige un JPG, PNG, WebP o HEIC.");
  }
  onStatus?.("Leyendo la foto…");
  const bitmap = await loadBitmap(file);
  try {
    const fitted = fitCanvas(bitmap);
    onStatus?.("Cargando el modelo. La primera vez tarda un momento…");
    const session = await openSession();
    const ort = await loadOrt();
    const feeds: Record<string, InstanceType<OrtModule["Tensor"]>> = {};
    feeds[session.inputNames[0]] = new ort.Tensor("float32", modelInput(fitted.canvas), [
      1,
      3,
      MODEL_SIZE,
      MODEL_SIZE,
    ]);
    onStatus?.("Quitando el fondo…");
    const outputs = await session.run(feeds);
    const firstName = session.outputNames[0];
    const output = outputs[firstName];
    if (!output || typeof output.data[0] !== "number") {
      throw new Error("El modelo no devolvió una máscara.");
    }
    const gray = maskValues(output.data as ArrayLike<number>);
    const alpha = alphaMask(gray, fitted.width, fitted.height);
    const frame = fitted.ctx.getImageData(0, 0, fitted.width, fitted.height);
    for (let i = 0; i < fitted.width * fitted.height; i += 1) {
      frame.data[i * 4 + 3] = alpha[i * 4];
    }
    fitted.ctx.putImageData(frame, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      fitted.canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("No se pudo guardar el PNG."));
      }, "image/png");
    });
    return { blob, width: fitted.width, height: fitted.height };
  } finally {
    bitmap.close?.();
  }
}
