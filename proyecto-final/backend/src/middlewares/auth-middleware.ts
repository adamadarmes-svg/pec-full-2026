import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/user-model";
import { verificarToken } from "../utils/jwt";
import { responderError } from "../utils/responder";
import { IUser } from "../types";

function extraerToken(req: Request): string | null {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith("Bearer ")) return null;
  const token = cabecera.slice("Bearer ".length).trim();
  return token || null;
}

// busco el usuario en cada petición para que uno borrado o desactivado pierda el acceso al momento
export async function proteger(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extraerToken(req);
    if (!token) {
      responderError(res, 401, "Unauthorized", "falta el token. entra para continuar.");
      return;
    }

    const payload = verificarToken(token);
    if (!payload) {
      responderError(res, 401, "Unauthorized", "sesión caducada o no válida. vuelve a entrar.");
      return;
    }

    const usuario = await User.findById(payload.id);
    if (!usuario) {
      responderError(res, 401, "Unauthorized", "tu usuario ya no existe.");
      return;
    }
    // uso 403 porque sí sé quién es pero la cuenta no tiene permiso
    if (!usuario.activo) {
      responderError(res, 403, "Forbidden", "tu cuenta está desactivada. habla con un administrador.");
      return;
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    next(err);
  }
}

// hice este para las rutas públicas que muestran más si estás identificado, nunca bloquea
export async function opcional(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extraerToken(req);
    const payload = token ? verificarToken(token) : null;
    if (payload) {
      const usuario = await User.findById(payload.id);
      // trato una cuenta desactivada como anónima igual que en proteger
      if (usuario?.activo) req.usuario = usuario;
    }
    next();
  } catch (err) {
    next(err);
  }
}

// va después de proteger porque necesita req.usuario
export async function soloAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.usuario?.rol !== "admin") {
      responderError(res, 403, "Forbidden", "solo para administradores.");
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

// comparo en texto porque un ObjectId y un string no son iguales con ===
export function esAutorOAdmin(req: Request, idPropietario: Types.ObjectId | string | null | undefined): boolean {
  const usuario = req.usuario;
  if (!usuario) return false;
  if (usuario.rol === "admin") return true;
  return Boolean(idPropietario) && String(usuario._id) === String(idPropietario);
}

// lanzo un error porque si falta req.usuario es un fallo mío al montar la ruta
export function exigirUsuario(req: Request): IUser {
  if (!req.usuario) {
    throw new Error("ruta protegida sin el middleware proteger: falta req.usuario");
  }
  return req.usuario;
}
