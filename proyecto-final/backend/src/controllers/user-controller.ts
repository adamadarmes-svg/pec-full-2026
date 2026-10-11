import { NextFunction, Request, Response } from "express";
import { User } from "../models/user-model";
import { responderError } from "../utils/responder";

// el password no sale porque el esquema lo tiene en select false
export async function listarUsuarios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuarios = await User.find().sort({ nombre: 1 });
    res.status(200).json(usuarios);
  } catch (err) {
    next(err);
  }
}

export async function obtenerUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      responderError(res, 404, "Not Found", "usuario no encontrado.");
      return;
    }
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
}

// no lo hasheo aquí porque ya lo hace el hook del modelo
export async function crearUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nuevo = await User.create(req.body);

    // lo quito a mano porque select false solo funciona en las consultas
    const { password, ...sinPassword } = nuevo.toObject();
    res.status(201).json(sinPassword);
  } catch (err) {
    next(err);
  }
}
