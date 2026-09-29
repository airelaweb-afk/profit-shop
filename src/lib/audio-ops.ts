export function encodeWav(buffer: AudioBuffer, startSec = 0, endSec?: number) {
  const sampleRate = buffer.sampleRate;
  const start = Math.max(0, Math.floor(startSec * sampleRate));
  const end = Math.min(
    buffer.length,
    Math.floor((endSec ?? buffer.duration) * sampleRate),
  );
  const length = Math.max(1, end - start);
  const channels = Math.min(2, buffer.numberOfChannels);
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = length * blockAlign;
  const header = 44;
  const out = new ArrayBuffer(header + dataSize);
  const view = new DataView(out);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);
  const ch0 = buffer.getChannelData(0);
  const ch1 = channels > 1 ? buffer.getChannelData(1) : ch0;
  let offset = 44;
  for (let i = start; i < start + length; i += 1) {
    view.setInt16(offset, floatToInt16(ch0[i] ?? 0), true);
    offset += 2;
    if (channels > 1) {
      view.setInt16(offset, floatToInt16(ch1[i] ?? 0), true);
      offset += 2;
    }
  }
  return new Blob([out], { type: "audio/wav" });
}

function floatToInt16(sample: number) {
  const clipped = Math.max(-1, Math.min(1, sample));
  return clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff;
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

export function isAudioFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    type.startsWith("audio/") ||
    name.endsWith(".mp3") ||
    name.endsWith(".m4a") ||
    name.endsWith(".aac") ||
    name.endsWith(".ogg") ||
    name.endsWith(".wav") ||
    name.endsWith(".webm") ||
    name.endsWith(".flac")
  );
}

export async function decodeAudio(file: File) {
  if (file.size > 40 * 1024 * 1024) {
    throw new Error("El audio pesa más de 40 MB. Usa uno más corto.");
  }
  const ctx = new AudioContext();
  try {
    const data = await file.arrayBuffer();
    return await ctx.decodeAudioData(data.slice(0));
  } catch {
    throw new Error(
      "No se pudo leer el audio. Prueba MP3, M4A, OGG, WAV o WebM. Codificar a MP3 o extraer el audio de un vídeo queda aparcado.",
    );
  } finally {
    await ctx.close();
  }
}
