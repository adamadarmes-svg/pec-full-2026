import { NextFunction, Request, Response } from "express";
import { User } from "../models/user-model";
import { responderError } from "../utils/responder";

// GET /api/users: el password no sale porque el esquema lo marca select: false
export async function listarUsuarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuarios = await User.find().sort({ nombre: 1 });
    res.status(200).json(usuarios);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
export async function obtenerUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      responderError(res, 404, "Not Found", "Usuario no encontrado");
      return;
    }
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
}

// POST /api/users: el hook pre("save") del modelo hashea la contraseña
export async function crearUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nuevo = await User.create(req.body);

    // create() devuelve el documento con el hash; select: false solo
    // afecta a las consultas, así que hay que quitarlo a mano
    const { password, ...sinPassword } = nuevo.toObject();
    res.status(201).json(sinPassword);
  } catch (err) {
    next(err);
  }
}
