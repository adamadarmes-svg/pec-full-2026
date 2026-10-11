import { API_URL, EVENTO_SESION_EXPIRADA, MENSAJES } from "@/const/config";
import { leerToken, limpiarSesion } from "@/services/sesionStorage";
import type { CuerpoErrorApi } from "@/types";

// guardo el status para distinguir un 404 de un 403 o un 400
export class ErrorApi extends Error {
  readonly status: number;
  readonly codigo: string;

  constructor(mensaje: string, status: number, codigo: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
    this.codigo = codigo;
  }
}

type MetodoHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface OpcionesPeticion {
  metodo?: MetodoHttp;
  cuerpo?: unknown;
  signal?: AbortSignal;
}

// ignoro las peticiones canceladas porque no son errores reales
export function esAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function mensajeDeError(error: unknown): string {
  return error instanceof Error && error.message ? error.message : MENSAJES.ERROR_GENERICO;
}

// solo bajo la primera letra si la segunda ya es minúscula, así no rompo siglas como ID
function aMinusculaInicial(texto: string): string {
  const [primera, segunda] = texto;
  if (!primera || !segunda || segunda !== segunda.toLowerCase()) return texto;
  return primera.toLowerCase() + texto.slice(1);
}

function esCuerpoError(datos: unknown): datos is CuerpoErrorApi {
  return typeof datos === "object" && datos !== null && "mensaje" in datos && typeof datos.mensaje === "string";
}

// relanzo la cancelación para que no parezca un éxito
async function leerJson(respuesta: Response): Promise<unknown> {
  try {
    return await respuesta.json();
  } catch (error) {
    if (esAbortError(error)) throw error;
    return null;
  }
}

// devuelvo la respuesta sin leer para decidir luego si es json o binario
async function solicitar({ metodo = "GET", cuerpo, signal }: OpcionesPeticion, endpoint: string): Promise<Response> {
  const token = leerToken();
  const cabeceras: Record<string, string> = {};
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${endpoint}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal,
    });
  } catch (error) {
    // fetch solo falla por red o cancelación, nunca por el status
    if (esAbortError(error)) throw error;
    throw new Error(MENSAJES.SIN_CONEXION);
  }

  if (!respuesta.ok) {
    const datos = await leerJson(respuesta);
    // solo cierro sesión con un 401 si había token, sin token es un login fallido
    if (respuesta.status === 401 && token) {
      limpiarSesion();
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    const mensaje = esCuerpoError(datos) ? aMinusculaInicial(datos.mensaje) : MENSAJES.ERROR_GENERICO;
    const codigo = esCuerpoError(datos) ? datos.error : "Error";
    throw new ErrorApi(mensaje, respuesta.status, codigo);
  }

  return respuesta;
}

export async function peticion<T>(endpoint: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const respuesta = await solicitar(opciones, endpoint);
  // confío en que el json tiene la forma del servicio, no lo valido en ejecución
  return (await leerJson(respuesta)) as T;
}

// lo hice para las imágenes sin publicar porque un img no manda el token
export async function obtenerBlob(endpoint: string, signal?: AbortSignal): Promise<Blob> {
  const respuesta = await solicitar({ signal }, endpoint);
  return respuesta.blob();
}

export function get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  return peticion<T>(endpoint, { signal });
}

export function post<T>(endpoint: string, cuerpo: unknown, signal?: AbortSignal): Promise<T> {
  return peticion<T>(endpoint, { metodo: "POST", cuerpo, signal });
}

export function put<T>(endpoint: string, cuerpo: unknown, signal?: AbortSignal): Promise<T> {
  return peticion<T>(endpoint, { metodo: "PUT", cuerpo, signal });
}

export function patch<T>(endpoint: string, cuerpo?: unknown, signal?: AbortSignal): Promise<T> {
  return peticion<T>(endpoint, { metodo: "PATCH", cuerpo, signal });
}

// delete es palabra reservada, por eso del
export function del<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  return peticion<T>(endpoint, { metodo: "DELETE", signal });
}
