import { NextFunction, Request, Response } from "express";
import { Source } from "../models/source-model";

// GET /api/sources: las más recientes primero
export async function getSources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fuentes = await Source.find().sort({ anio: -1 });
    res.status(200).json(fuentes);
  } catch (err) {
    next(err);
  }
}

// GET /api/sources/:id
export async function getSource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fuente = await Source.findById(req.params.id);
    if (!fuente) {
      res.status(404).json({ mensaje: "Fuente no encontrada" });
      return;
    }
    res.status(200).json(fuente);
  } catch (err) {
    next(err);
  }
}

// POST /api/sources
export async function createSource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nueva = await Source.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
}
