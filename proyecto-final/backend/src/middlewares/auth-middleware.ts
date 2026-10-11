import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/user-model";
import { verificarToken } from "../utils/jwt";
import { responderError } from "../utils/responder";
import { IUser } from "../types";

// Extrae el token de la cabecera "Authorization: Bearer TOKEN", o null si no viene
function extraerToken(req: Request): string | null {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith("Bearer ")) return null;
  const token = cabecera.slice("Bearer ".length).trim();
  return token || null;
}

// Exige un usuario autenticado y activo. Se busca en la BD en cada petición
// (en vez de fiarse solo del token) para que un usuario borrado o
// desactivado pierda el acceso aunque su token aún no haya caducado.
export async function proteger(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extraerToken(req);
    if (!token) {
      responderError(res, 401, "Unauthorized", "No se ha enviado ningún token. Inicia sesión para continuar.");
      return;
    }

    const payload = verificarToken(token);
    if (!payload) {
      responderError(res, 401, "Unauthorized", "El token no es válido o ha caducado. Vuelve a iniciar sesión.");
      return;
    }

    const usuario = await User.findById(payload.id);
    if (!usuario) {
      responderError(res, 401, "Unauthorized", "El usuario de este token ya no existe.");
      return;
    }
    // 403 y no 401: la identidad es correcta, pero la cuenta no tiene permiso
    if (!usuario.activo) {
      responderError(res, 403, "Forbidden", "Tu cuenta está desactivada. Contacta con un administrador.");
      return;
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    next(err);
  }
}

// Para rutas públicas que muestran algo distinto a usuarios identificados.
// Nunca bloquea: sin token, o con un token inválido, sigue como anónimo.
export async function opcional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extraerToken(req);
    const payload = token ? verificarToken(token) : null;
    if (payload) {
      const usuario = await User.findById(payload.id);
      // Una cuenta desactivada se trata como anónima, igual que en proteger
      if (usuario?.activo) req.usuario = usuario;
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Debe ir después de proteger, que es quien rellena req.usuario
export async function soloAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.usuario?.rol !== "admin") {
      responderError(res, 403, "Forbidden", "Esta acción solo está permitida a administradores.");
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Para recursos con propietario (imágenes, observaciones): puede modificarlos
// su autor o un administrador. Se compara en texto porque un ObjectId y un
// string con el mismo id no son iguales con ===. Un recurso sin propietario
// (datos antiguos sin creadoPor) solo lo puede tocar un administrador.
export function esAutorOAdmin(req: Request, idPropietario: Types.ObjectId | string | null | undefined): boolean {
  const usuario = req.usuario;
  if (!usuario) return false;
  if (usuario.rol === "admin") return true;
  return Boolean(idPropietario) && String(usuario._id) === String(idPropietario);
}

// Devuelve el usuario autenticado en controladores que van detrás de
// proteger. Si falta es un error de programación (ruta montada sin proteger),
// por eso lanza y acaba en un 500 en lugar de responder 401.
export function exigirUsuario(req: Request): IUser {
  if (!req.usuario) {
    throw new Error("Ruta protegida sin el middleware proteger: req.usuario no está definido");
  }
  return req.usuario;
}
