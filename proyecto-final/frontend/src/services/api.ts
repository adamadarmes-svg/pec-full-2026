import { API_URL, EVENTO_SESION_EXPIRADA, MENSAJES } from "@/const/config";
import { leerToken, limpiarSesion } from "@/services/sesionStorage";
import type { CuerpoErrorApi } from "@/types";

// Error de la API con su status HTTP, para que la interfaz pueda distinguir
// un 404 de un 403 o de un 400 de validación
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

// Una petición cancelada con AbortController no es un error real: los
// hooks la ignoran en lugar de mostrar un mensaje
export function esAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

// Texto apto para mostrar al usuario a partir de cualquier error capturado
export function mensajeDeError(error: unknown): string {
  return error instanceof Error && error.message ? error.message : MENSAJES.ERROR_GENERICO;
}

function esCuerpoError(datos: unknown): datos is CuerpoErrorApi {
  return typeof datos === "object" && datos !== null && "mensaje" in datos && typeof datos.mensaje === "string";
}

// Lee el JSON de la respuesta. Un cuerpo vacío o no JSON devuelve null, pero
// una cancelación a mitad de lectura se relanza para que no parezca un éxito.
async function leerJson(respuesta: Response): Promise<unknown> {
  try {
    return await respuesta.json();
  } catch (error) {
    if (esAbortError(error)) throw error;
    return null;
  }
}

// Capa base de todas las llamadas a la API
export async function peticion<T>(endpoint: string, { metodo = "GET", cuerpo, signal }: OpcionesPeticion = {}): Promise<T> {
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
    // fetch solo rechaza por cancelación o por red; nunca por un status HTTP
    if (esAbortError(error)) throw error;
    throw new Error(MENSAJES.SIN_CONEXION);
  }

  const datos = await leerJson(respuesta);

  if (!respuesta.ok) {
    // Un 401 con token significa que el servidor lo rechaza (caducado o
    // usuario borrado). Sin token es solo un login fallido y no hay sesión
    // que cerrar.
    if (respuesta.status === 401 && token) {
      limpiarSesion();
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }
    const mensaje = esCuerpoError(datos) ? datos.mensaje : MENSAJES.ERROR_GENERICO;
    const codigo = esCuerpoError(datos) ? datos.error : "Error";
    throw new ErrorApi(mensaje, respuesta.status, codigo);
  }

  // Punto de confianza: el JSON se asume con la forma que declara el
  // servicio que llama. No hay validación en tiempo de ejecución.
  return datos as T;
}

// Atajos por método HTTP
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

// "delete" es palabra reservada en JavaScript, de ahí el nombre corto
export function del<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  return peticion<T>(endpoint, { metodo: "DELETE", signal });
}
