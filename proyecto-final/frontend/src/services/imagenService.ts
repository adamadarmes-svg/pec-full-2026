import { API_URL } from "@/const/config";
import { del, get, obtenerBlob, patch, post, put } from "@/services/api";
import type { CambiosImagen, DatosImagenNueva, Imagen, RespuestaEliminacion } from "@/types";

// los listados nunca traen el base64
export function listarPorExoplaneta(exoplanetaId: string, signal?: AbortSignal): Promise<Imagen[]> {
  return get<Imagen[]>(`/images?exoplaneta=${encodeURIComponent(exoplanetaId)}`, signal);
}

// el admin recibe todas, es lo que usa el panel de moderación
export function listar(signal?: AbortSignal): Promise<Imagen[]> {
  return get<Imagen[]>("/images", signal);
}

export function obtener(id: string, signal?: AbortSignal): Promise<Imagen> {
  return get<Imagen>(`/images/${id}`, signal);
}

// se crea sin publicar hasta que la apruebe un admin
export function crear(datos: DatosImagenNueva): Promise<Imagen> {
  return post<Imagen>("/images", datos);
}

export function actualizar(id: string, cambios: CambiosImagen): Promise<Imagen> {
  return put<Imagen>(`/images/${id}`, cambios);
}

// fijo el estado en vez de alternarlo, igual que la api
export function publicar(id: string, publicada = true): Promise<Imagen> {
  return patch<Imagen>(`/images/${id}/publicar`, { publicada });
}

export function eliminar(id: string): Promise<RespuestaEliminacion> {
  return del<RespuestaEliminacion>(`/images/${id}`);
}

// solo sirve para publicadas porque un img no manda el token
export function urlArchivo(id: string): string {
  return `${API_URL}/images/${id}/archivo`;
}

// lo centralicé para no decidir en cada componente de dónde sale la imagen
export function urlImagen({ _id, origen, url }: Pick<Imagen, "_id" | "origen" | "url">): string | undefined {
  return origen === "subida" ? urlArchivo(_id) : url;
}

export function obtenerArchivoPrivado(id: string, signal?: AbortSignal): Promise<Blob> {
  return obtenerBlob(`/images/${id}/archivo`, signal);
}
