import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";
import { IUser, PayloadJWT, RolUsuario, ROLES_USUARIO } from "../types";

function esRolUsuario(valor: unknown): valor is RolUsuario {
  return ROLES_USUARIO.some((rol) => rol === valor);
}

export function generarToken(usuario: IUser): string {
  const payload: PayloadJWT = {
    id: String(usuario._id),
    email: usuario.email,
    rol: usuario.rol,
  };
  // ya no necesito casting porque env.ts deja el tipo listo
  const opciones: SignOptions = { expiresIn: ENV.JWT_EXPIRES_IN };
  return jwt.sign(payload, ENV.JWT_SECRET, opciones);
}

// no lanzo error para que el middleware pueda responder 401 directamente
export function verificarToken(token: string): PayloadJWT | null {
  try {
    const decodificado = jwt.verify(token, ENV.JWT_SECRET);
    // verify puede devolver un string, por eso lo descarto
    if (typeof decodificado === "string") return null;

    const { id, email, rol } = decodificado;
    if (typeof id !== "string" || typeof email !== "string" || !esRolUsuario(rol)) {
      return null;
    }
    return { id, email, rol };
  } catch {
    return null;
  }
}
