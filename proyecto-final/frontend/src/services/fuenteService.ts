import { get, post } from "@/services/api";
import type { DatosFuente, Fuente } from "@/types";

export function listar(signal?: AbortSignal): Promise<Fuente[]> {
  return get<Fuente[]>("/sources", signal);
}

export function obtener(id: string, signal?: AbortSignal): Promise<Fuente> {
  return get<Fuente>(`/sources/${id}`, signal);
}

export function crear(datos: DatosFuente): Promise<Fuente> {
  return post<Fuente>("/sources", datos);
}
