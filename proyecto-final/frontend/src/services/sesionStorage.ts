import { CLAVES_STORAGE } from "@/const/config";
import type { Usuario } from "@/types";

// todo va en try/catch porque localStorage falla en modo privado

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVES_STORAGE.TOKEN);
  } catch {
    return null;
  }
}

// no lo valido aquí, lo valida quien lo lee
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
    // sin almacenamiento la sesión dura lo que la pestaña
  }
}

export function guardarUsuario(usuario: Usuario): void {
  try {
    localStorage.setItem(CLAVES_STORAGE.USUARIO, JSON.stringify(usuario));
  } catch {
    // igual que en guardarSesion
  }
}

export function limpiarSesion(): void {
  try {
    localStorage.removeItem(CLAVES_STORAGE.TOKEN);
    localStorage.removeItem(CLAVES_STORAGE.USUARIO);
  } catch {
    // si no hay acceso tampoco hay nada que limpiar
  }
}
