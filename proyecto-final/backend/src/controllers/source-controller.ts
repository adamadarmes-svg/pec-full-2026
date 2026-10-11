import { NextFunction, Request, Response } from "express";
import { Source } from "../models/source-model";
import { Exoplanet } from "../models/exoplanet-model";
import { responderError } from "../utils/responder";

function noEncontrada(res: Response): void {
  responderError(res, 404, "Not Found", "Fuente no encontrada");
}

// GET /api/sources: las más recientes primero
export async function listarFuentes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fuentes = await Source.find().sort({ anio: -1 });
    res.status(200).json(fuentes);
  } catch (err) {
    next(err);
  }
}

// GET /api/sources/:id
export async function obtenerFuente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fuente = await Source.findById(req.params.id);
    if (!fuente) {
      noEncontrada(res);
      return;
    }
    res.status(200).json(fuente);
  } catch (err) {
    next(err);
  }
}

// POST /api/sources (protegida)
export async function crearFuente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nueva = await Source.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
}

// PUT /api/sources/:id (solo admin: las fuentes son catálogo compartido)
export async function actualizarFuente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fuente = await Source.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!fuente) {
      noEncontrada(res);
      return;
    }
    res.status(200).json(fuente);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/sources/:id (solo admin)
export async function eliminarFuente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Si algún exoplaneta la cita se rechaza el borrado: dejaría su
    // fuentePrincipal apuntando a un documento inexistente
    const enUso = await Exoplanet.countDocuments({ fuentePrincipal: req.params.id });
    if (enUso > 0) {
      responderError(
        res,
        409,
        "Conflict",
        `No se puede eliminar: ${enUso} exoplaneta(s) la usan como fuente principal. Cambia antes su fuente.`
      );
      return;
    }

    const fuente = await Source.findByIdAndDelete(req.params.id);
    if (!fuente) {
      noEncontrada(res);
      return;
    }
    res.status(200).json({ mensaje: "Fuente eliminada", id: req.params.id });
  } catch (err) {
    next(err);
  }
}
