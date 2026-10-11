import type { FormatoImagen } from "@/types";

// miro los primeros bytes y no file.type porque basta renombrar un svg para engañarlo
export async function detectarFormato(archivo: File): Promise<FormatoImagen | null> {
  const b = new Uint8Array(await archivo.slice(0, 12).arrayBuffer());

  // jpeg: ff d8 ff
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  // png: 89 50 4e 47 0d 0a 1a 0a
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a) return "png";
  // gif: empieza por "GIF8"
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "gif";
  // webp: "RIFF", cuatro bytes de tamaño y "WEBP"
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}
