import { CLAVES_STORAGE } from "@/const/config";
import type { Usuario } from "@/types";

// Único punto de acceso a la sesión guardada en localStorage. Lo usan tanto
// api.ts (para leer el token) como AuthContext (para guardarla y cargarla).
// Todo va en try/catch porque localStorage lanza en modo privado o si el
// navegador lo tiene bloqueado, y eso no debe tumbar la aplicación.

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVES_STORAGE.TOKEN);
  } catch {
    return null;
  }
}

// Devuelve el usuario sin validar: quien lo lee decide si es válido
export function leerUsuarioCrudo(): string | null {
  try {
    return localStorage.getItem(CLAVES_STORAGE.USUARIO);
  } catch {
    return null;
  }
}

export function guardarSesion(token: string, usuario: Usuario): void {
  try {
    localStorage.setItem(CLAVES_STORAGE.TOKEN, token);
    localStorage.setItem(CLAVES_STORAGE.USUARIO, JSON.stringify(usuario));
  } catch {
    // Sin almacenamiento la sesión dura lo que la pestaña, pero funciona
  }
}

export function guardarUsuario(usuario: Usuario): void {
  try {
    localStorage.setItem(CLAVES_STORAGE.USUARIO, JSON.stringify(usuario));
  } catch {
    // Igual que en guardarSesion
  }
}

export function limpiarSesion(): void {
  try {
    localStorage.removeItem(CLAVES_STORAGE.TOKEN);
    localStorage.removeItem(CLAVES_STORAGE.USUARIO);
  } catch {
    // Si no se puede acceder tampoco hay nada que limpiar
  }
}
