import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../config/env";
import { IUser, PayloadJWT, RolUsuario, ROLES_USUARIO } from "../types";

// Comprueba que un valor desconocido sea uno de los roles válidos
function esRolUsuario(valor: unknown): valor is RolUsuario {
  return ROLES_USUARIO.some((rol) => rol === valor);
}

// Firma un token con los datos mínimos para identificar al usuario
export function generarToken(usuario: IUser): string {
  const payload: PayloadJWT = {
    id: String(usuario._id),
    email: usuario.email,
    rol: usuario.rol,
  };
  // ENV.JWT_EXPIRES_IN ya tiene el tipo que exige SignOptions gracias al
  // type guard de env.ts, por eso no hace falta ningún casting aquí
  const opciones: SignOptions = { expiresIn: ENV.JWT_EXPIRES_IN };
  return jwt.sign(payload, ENV.JWT_SECRET, opciones);
}

// Devuelve el payload si el token es válido, o null si es inválido, ha
// caducado o no tiene la forma esperada. No lanza para que el middleware
// pueda responder 401 sin pasar por el manejador de errores.
export function verificarToken(token: string): PayloadJWT | null {
  try {
    const decodificado = jwt.verify(token, ENV.JWT_SECRET);
    // verify puede devolver un string si se firmó un payload de texto
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
