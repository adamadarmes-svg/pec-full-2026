import { API_URL } from "@/const/config";
import { del, get, patch, post, put } from "@/services/api";
import type { CambiosImagen, DatosImagenNueva, Imagen, RespuestaEliminacion } from "@/types";

// Sin datos (Base64): los listados nunca lo incluyen
export function listarPorExoplaneta(exoplanetaId: string, signal?: AbortSignal): Promise<Imagen[]> {
  return get<Imagen[]>(`/images?exoplaneta=${encodeURIComponent(exoplanetaId)}`, signal);
}

// Detalle completo, con datos si la imagen es una subida
export function obtener(id: string, signal?: AbortSignal): Promise<Imagen> {
  return get<Imagen>(`/images/${id}`, signal);
}

// La imagen se crea siempre sin publicar: queda pendiente de un administrador
export function crear(datos: DatosImagenNueva): Promise<Imagen> {
  return post<Imagen>("/images", datos);
}

export function actualizar(id: string, cambios: CambiosImagen): Promise<Imagen> {
  return put<Imagen>(`/images/${id}`, cambios);
}

// Solo admin. Fija el estado en vez de alternarlo, como hace la API.
export function publicar(id: string, publicada = true): Promise<Imagen> {
  return patch<Imagen>(`/images/${id}/publicar`, { publicada });
}

export function eliminar(id: string): Promise<RespuestaEliminacion> {
  return del<RespuestaEliminacion>(`/images/${id}`);
}

// URL del binario para usar en <img src>. Un <img> no envía la cabecera
// Authorization, así que solo sirve para imágenes publicadas; para
// previsualizar una propia sin publicar hay que usar el datos de obtener().
export function urlArchivo(id: string): string {
  return `${API_URL}/images/${id}/archivo`;
}
