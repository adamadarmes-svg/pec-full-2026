import { del, get, patch, post, put } from "@/services/api";
import type { DatosObservacion, Observacion, RespuestaEliminacion } from "@/types";

// listar y crear cuelgan del exoplaneta, editar y borrar van por su id
export function listarPorExoplaneta(exoplanetaId: string, signal?: AbortSignal): Promise<Observacion[]> {
  return get<Observacion[]>(`/exoplanets/${exoplanetaId}/observations`, signal);
}

export function crear(exoplanetaId: string, datos: DatosObservacion): Promise<Observacion> {
  return post<Observacion>(`/exoplanets/${exoplanetaId}/observations`, datos);
}

export function actualizar(id: string, cambios: Partial<DatosObservacion>): Promise<Observacion> {
  return put<Observacion>(`/observations/${id}`, cambios);
}

export function listarOcultas(signal?: AbortSignal): Promise<Observacion[]> {
  return get<Observacion[]>("/observations?visible=false", signal);
}

export function ocultar(id: string, visible = false): Promise<Observacion> {
  return patch<Observacion>(`/observations/${id}/ocultar`, { visible });
}

export function eliminar(id: string): Promise<RespuestaEliminacion> {
  return del<RespuestaEliminacion>(`/observations/${id}`);
}
