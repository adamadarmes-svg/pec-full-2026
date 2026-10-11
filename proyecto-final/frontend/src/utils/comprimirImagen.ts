import { LIMITES } from "@/const/catalogo";
import type { FormatoImagen } from "@/types";
import { formatearNumero } from "@/utils/formato";
import { detectarFormato } from "@/utils/tipoImagen";

export interface ImagenComprimida {
  // data uri completo, listo para mandarlo
  datos: string;
  formato: FormatoImagen;
  // solo para mostrarlo, el backend lo recalcula
  tamanoKb: number;
}

// con un mensaje que se puede enseñar tal cual
export class ErrorImagen extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorImagen";
  }
}

const ANCHO_MAXIMO = 1600;
const CALIDADES = [0.82, 0.72, 0.62, 0.52, 0.42];
const LIMITE_KB = LIMITES.IMAGEN_BASE64_OBJETIVO_KB;

// mido el base64 y no el blob porque ocupa un tercio más y es lo que viaja hasta el límite de 4,5 mb de vercel
function kbEnBase64(dataUri: string): number {
  return dataUri.length / 1024;
}

// cada 4 caracteres base64 son 3 bytes
function kbReales(dataUri: string): number {
  const base64 = dataUri.slice(dataUri.indexOf(",") + 1);
  const relleno = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.round(((base64.length * 3) / 4 - relleno) / 1024);
}

// leo el formato del resultado porque si el navegador no sabe webp devuelve png sin avisar
function formatoDeDataUri(dataUri: string): FormatoImagen {
  if (dataUri.startsWith("data:image/webp")) return "webp";
  if (dataUri.startsWith("data:image/png")) return "png";
  return "jpeg";
}

function leerComoDataUri(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => (typeof lector.result === "string" ? resolver(lector.result) : rechazar(new Error()));
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(archivo);
  });
}

// solo miro el canal alfa y paro en el primer píxel transparente
function tieneTransparencia(contexto: CanvasRenderingContext2D, ancho: number, alto: number): boolean {
  const { data } = contexto.getImageData(0, 0, ancho, alto);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function demasiadoGrande(kb: number, detalle: string): ErrorImagen {
  return new ErrorImagen(
    `la imagen ocupa ${formatearNumero(Math.round(kb))} kilobytes ${detalle} y el máximo es ${formatearNumero(LIMITE_KB)}. redúcela o recórtala.`
  );
}

export async function comprimirImagen(archivo: File): Promise<ImagenComprimida> {
  const formatoOriginal = await detectarFormato(archivo);
  if (!formatoOriginal) {
    throw new ErrorImagen("formato no admitido. usa jpeg, png, webp o gif.");
  }

  // el gif no pasa por el canvas porque perdería la animación y se quedaría en el primer fotograma
  if (formatoOriginal === "gif") {
    const datos = await leerComoDataUri(archivo);
    const kb = kbEnBase64(datos);
    if (kb > LIMITE_KB) {
      throw new ErrorImagen(
        `este gif ocupa ${formatearNumero(Math.round(kb))} kilobytes y el máximo es ${formatearNumero(LIMITE_KB)}. los gif no se comprimen para no perder la animación.`
      );
    }
    return { datos, formato: "gif", tamanoKb: kbReales(datos) };
  }

  const mapa = await createImageBitmap(archivo);
  try {
    // 1600 px bastan para pantalla completa sin mandar fotos enormes
    const escala = Math.min(1, ANCHO_MAXIMO / mapa.width);
    const ancho = Math.round(mapa.width * escala);
    const alto = Math.round(mapa.height * escala);

    const lienzo = document.createElement("canvas");
    lienzo.width = ancho;
    lienzo.height = alto;
    const contexto = lienzo.getContext("2d");
    if (!contexto) throw new ErrorImagen("tu navegador no pudo procesar la imagen. prueba con otro.");
    contexto.drawImage(mapa, 0, 0, ancho, alto);

    // exporto a webp si hay transparencia porque jpeg la rellena de negro
    const conTransparencia = (formatoOriginal === "png" || formatoOriginal === "webp") && tieneTransparencia(contexto, ancho, alto);
    const tipoSalida = conTransparencia ? "image/webp" : "image/jpeg";

    let ultimoKb = 0;
    for (const calidad of CALIDADES) {
      const datos = lienzo.toDataURL(tipoSalida, calidad);
      ultimoKb = kbEnBase64(datos);
      if (ultimoKb <= LIMITE_KB) {
        return { datos, formato: formatoDeDataUri(datos), tamanoKb: kbReales(datos) };
      }
    }
    throw demasiadoGrande(ultimoKb, "comprimida al máximo");
  } finally {
    // libero el mapa de bits porque ocupa mucha memoria
    mapa.close();
  }
}
