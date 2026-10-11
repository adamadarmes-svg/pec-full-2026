import { del, get, patch, post, put } from "@/services/api";
import type { DatosObservacion, Observacion, RespuestaEliminacion } from "@/types";

// Las observaciones cuelgan de un exoplaneta para listar y crear, pero se
// editan y borran por su propio id
export function listarPorExoplaneta(exoplanetaId: string, signal?: AbortSignal): Promise<Observacion[]> {
  return get<Observacion[]>(`/exoplanets/${exoplanetaId}/observations`, signal);
}

export function crear(exoplanetaId: string, datos: DatosObservacion): Promise<Observacion> {
  return post<Observacion>(`/exoplanets/${exoplanetaId}/observations`, datos);
}

export function actualizar(id: string, cambios: Partial<DatosObservacion>): Promise<Observacion> {
  return put<Observacion>(`/observations/${id}`, cambios);
}

// Solo admin. visible = false oculta; true la vuelve a mostrar.
export function ocultar(id: string, visible = false): Promise<Observacion> {
  return patch<Observacion>(`/observations/${id}/ocultar`, { visible });
}

export function eliminar(id: string): Promise<RespuestaEliminacion> {
  return del<RespuestaEliminacion>(`/observations/${id}`);
}
