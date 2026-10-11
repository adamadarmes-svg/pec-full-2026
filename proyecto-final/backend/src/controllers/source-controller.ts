import { NextFunction, Request, Response } from "express";
import { Source } from "../models/source-model";
import { Exoplanet } from "../models/exoplanet-model";
import { responderError } from "../utils/responder";

function noEncontrada(res: Response): void {
  responderError(res, 404, "Not Found", "fuente no encontrada.");
}

export async function listarFuentes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fuentes = await Source.find().sort({ anio: -1 });
    res.status(200).json(fuentes);
  } catch (err) {
    next(err);
  }
}

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

export async function crearFuente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nueva = await Source.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
}

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

export async function eliminarFuente(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // no dejo borrar una fuente en uso para no dejar referencias rotas
    const enUso = await Exoplanet.countDocuments({ fuentePrincipal: req.params.id });
    if (enUso > 0) {
      responderError(
        res,
        409,
        "Conflict",
        `la usan ${enUso} exoplaneta(s). cámbiales la fuente antes de eliminarla.`
      );
      return;
    }

    const fuente = await Source.findByIdAndDelete(req.params.id);
    if (!fuente) {
      noEncontrada(res);
      return;
    }
    res.status(200).json({ mensaje: "fuente eliminada", id: req.params.id });
  } catch (err) {
    next(err);
  }
}
