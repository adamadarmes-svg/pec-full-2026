import { NextFunction, Request, Response } from "express";
import { User } from "../models/user-model";
import { generarToken } from "../utils/jwt";
import { IUser, RespuestaAuth, RespuestaError, UsuarioPublico } from "../types";

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

// Quita el password antes de responder. Aunque el esquema lo oculta en las
// consultas, sigue presente tras create() o tras un select("+password").
function usuarioSinPassword(usuario: IUser): UsuarioPublico {
  const { password, ...publico } = usuario.toObject<UsuarioPublico & { password?: string }>();
  return publico;
}

function responderError(res: Response, status: number, error: string, mensaje: string): void {
  const cuerpo: RespuestaError = { error, mensaje };
  res.status(status).json(cuerpo);
}

// El esquema guarda el email en minúsculas, así que hay que buscarlo igual
function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

// POST /api/auth/registro
export async function registrarUsuario(
  req: Request<{}, unknown, CuerpoRegistro>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { nombre, email, password, institucion } = req.body;

    if (!nombre?.trim() || !email?.trim() || !password) {
      responderError(res, 400, "Bad Request", "Nombre, email y contraseña son obligatorios.");
      return;
    }
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
      responderError(
        res,
        400,
        "Bad Request",
        `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
      );
      return;
    }

    // Comprobación previa para dar un mensaje claro. Si dos registros llegan a
    // la vez, el índice único lo frena igualmente y el errorHandler responde 409.
    const emailNormalizado = normalizarEmail(email);
    if (await User.exists({ email: emailNormalizado })) {
      responderError(res, 409, "Conflict", "Ya existe una cuenta con ese email.");
      return;
    }

    // El rol se fija aquí y nunca se lee del body: si se aceptara, cualquiera
    // podría registrarse como admin (escalada de privilegios)
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

// POST /api/auth/login
export async function iniciarSesion(
  req: Request<{}, unknown, CuerpoLogin>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      responderError(res, 400, "Bad Request", "Email y contraseña son obligatorios.");
      return;
    }

    // select("+password") porque el esquema lo excluye por defecto y sin él
    // compararPassword no tendría con qué comparar
    const usuario = await User.findOne({ email: normalizarEmail(email) }).select("+password");

    // Mismo mensaje si el email no existe o la contraseña falla: así no se
    // puede averiguar qué emails están registrados probando el login
    if (!usuario || !(await usuario.compararPassword(password))) {
      responderError(res, 401, "Unauthorized", "Email o contraseña incorrectos.");
      return;
    }

    // Se comprueba después de la contraseña para no revelar el estado de la
    // cuenta a quien no conoce sus credenciales
    if (!usuario.activo) {
      responderError(res, 403, "Forbidden", "Tu cuenta está desactivada. Contacta con un administrador.");
      return;
    }

    const respuesta: RespuestaAuth = { usuario: usuarioSinPassword(usuario), token: generarToken(usuario) };
    res.status(200).json(respuesta);
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/perfil (tras el middleware proteger)
export async function obtenerPerfil(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // proteger garantiza req.usuario; la comprobación es por si la ruta se
    // montara alguna vez sin él
    if (!req.usuario) {
      responderError(res, 401, "Unauthorized", "Inicia sesión para ver tu perfil.");
      return;
    }
    res.status(200).json({ usuario: usuarioSinPassword(req.usuario) });
  } catch (err) {
    next(err);
  }
}
