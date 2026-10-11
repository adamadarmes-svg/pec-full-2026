import { NextFunction, Request, Response } from "express";
import { User } from "../models/user-model";
import { generarToken } from "../utils/jwt";
import { responderError } from "../utils/responder";
import { IUser, RespuestaAuth, UsuarioPublico } from "../types";

interface CuerpoRegistro {
  nombre?: string;
  email?: string;
  password?: string;
  institucion?: string;
}

interface CuerpoLogin {
  email?: string;
  password?: string;
}

const LONGITUD_MINIMA_PASSWORD = 6;

// quito el password a mano porque después de create() sigue en el documento
function usuarioSinPassword(usuario: IUser): UsuarioPublico {
  const { password, ...publico } = usuario.toObject<UsuarioPublico & { password?: string }>();
  return publico;
}

// paso el email a minúsculas porque así lo guarda el esquema y si no no lo encontraba
function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registrarUsuario(
  req: Request<{}, unknown, CuerpoRegistro>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nombre, email, password, institucion } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password) {
      responderError(res, 400, "Bad Request", "faltan el nombre, el email o la contraseña.");
      return;
    }
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
      responderError(
        res,
        400,
        "Bad Request",
        `la contraseña necesita al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
      );
      return;
    }

    // lo compruebo antes solo para dar un mensaje claro, el índice único ya frena los duplicados
    const emailNormalizado = normalizarEmail(email);
    if (await User.exists({ email: emailNormalizado })) {
      responderError(res, 409, "Conflict", "ese email ya tiene cuenta. entra con él.");
      return;
    }

    // fijé el rol aquí para que nadie pueda registrarse como admin desde el body
    const usuario = await User.create({
      nombre,
      email: emailNormalizado,
      password,
      institucion,
      rol: "investigador",
    });

    const respuesta: RespuestaAuth = { usuario: usuarioSinPassword(usuario), token: generarToken(usuario) };
    res.status(201).json(respuesta);
  } catch (err) {
    next(err);
  }
}

export async function iniciarSesion(
  req: Request<{}, unknown, CuerpoLogin>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      responderError(res, 400, "Bad Request", "escribe el email y la contraseña.");
      return;
    }

    // pido el password con select porque el esquema lo esconde y sin él no puedo compararlo
    const usuario = await User.findOne({ email: normalizarEmail(email) }).select("+password");

    // uso el mismo mensaje en los dos casos para que no se pueda averiguar qué emails existen
    if (!usuario || !(await usuario.compararPassword(password))) {
      responderError(res, 401, "Unauthorized", "email o contraseña incorrectos.");
      return;
    }

    // miro si está activa después de la contraseña para no dar pistas a quien no la sabe
    if (!usuario.activo) {
      responderError(res, 403, "Forbidden", "tu cuenta está desactivada. habla con un administrador.");
      return;
    }

    const respuesta: RespuestaAuth = { usuario: usuarioSinPassword(usuario), token: generarToken(usuario) };
    res.status(200).json(respuesta);
  } catch (err) {
    next(err);
  }
}

export async function obtenerPerfil(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // lo compruebo por si algún día la ruta se monta sin proteger
    if (!req.usuario) {
      responderError(res, 401, "Unauthorized", "entra para ver tu perfil.");
      return;
    }
    res.status(200).json({ usuario: usuarioSinPassword(req.usuario) });
  } catch (err) {
    next(err);
  }
}
