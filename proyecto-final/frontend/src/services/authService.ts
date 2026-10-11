import { get, post } from "@/services/api";
import type { DatosLogin, DatosRegistro, RespuestaAuth, Usuario } from "@/types";

export function registrar(datos: DatosRegistro): Promise<RespuestaAuth> {
  return post<RespuestaAuth>("/auth/registro", datos);
}

export function iniciarSesion(datos: DatosLogin): Promise<RespuestaAuth> {
  return post<RespuestaAuth>("/auth/login", datos);
}

// La API envuelve el usuario en { usuario }; aquí se desenvuelve para que
// quien llame reciba directamente el Usuario
export async function obtenerPerfil(signal?: AbortSignal): Promise<Usuario> {
  const respuesta = await get<{ usuario: Usuario }>("/auth/perfil", signal);
  return respuesta.usuario;
}
