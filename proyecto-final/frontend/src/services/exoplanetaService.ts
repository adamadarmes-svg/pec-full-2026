import { del, get, post, put } from "@/services/api";
import type {
  CambiosExoplaneta,
  DatosExoplaneta,
  Exoplaneta,
  FiltrosExoplanetas,
  RespuestaEliminacionExoplaneta,
  RespuestaExoplanetas,
} from "@/types";

// Construye la query string solo con los filtros que tienen valor. Se
// recorren las claves de una en una, en vez de con Object.entries, para que
// cada valor conserve su tipo.
function construirQuery(filtros: FiltrosExoplanetas): string {
  const parametros = new URLSearchParams();
  const anadir = (clave: string, valor: string | number | boolean | undefined) => {
    if (valor === undefined || valor === "") return;
    parametros.set(clave, String(valor));
  };

  anadir("pagina", filtros.pagina);
  anadir("limite", filtros.limite);
  anadir("buscar", filtros.buscar?.trim());
  anadir("tipoPlaneta", filtros.tipoPlaneta);
  // La API espera los tipos múltiples separados por comas
  if (filtros.tipos && filtros.tipos.length > 0) parametros.set("tipos", filtros.tipos.join(","));
  anadir("metodoDescubrimiento", filtros.metodoDescubrimiento);
  anadir("zonaHabitable", filtros.zonaHabitable);
  anadir("confirmado", filtros.confirmado);
  anadir("anioDesde", filtros.anioDesde);
  anadir("anioHasta", filtros.anioHasta);
  anadir("distanciaMax", filtros.distanciaMax);

  const query = parametros.toString();
  return query ? `?${query}` : "";
}

export function listar(filtros: FiltrosExoplanetas = {}, signal?: AbortSignal): Promise<RespuestaExoplanetas> {
  return get<RespuestaExoplanetas>(`/exoplanets${construirQuery(filtros)}`, signal);
}

export function obtener(id: string, signal?: AbortSignal): Promise<Exoplaneta> {
  return get<Exoplaneta>(`/exoplanets/${id}`, signal);
}

// Ojo: crear y actualizar devuelven el exoplaneta sin populate (las
// referencias llegan como id), a diferencia de obtener
export function crear(datos: DatosExoplaneta): Promise<Exoplaneta> {
  return post<Exoplaneta>("/exoplanets", datos);
}

export function actualizar(id: string, cambios: CambiosExoplaneta): Promise<Exoplaneta> {
  return put<Exoplaneta>(`/exoplanets/${id}`, cambios);
}

export function eliminar(id: string): Promise<RespuestaEliminacionExoplaneta> {
  return del<RespuestaEliminacionExoplaneta>(`/exoplanets/${id}`);
}
