import { NextFunction, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Exoplanet } from "../models/exoplanet-model";
import { IExoplanet } from "../types";

// Parámetros de consulta admitidos en el listado. Llegan siempre como texto.
interface ConsultaExoplanetas {
  tipoPlaneta?: string;
  zonaHabitable?: string;
  metodoDescubrimiento?: string;
  buscar?: string;
  pagina?: string;
  limite?: string;
}

// GET /api/exoplanets: listado con filtros opcionales y paginación
export async function getExoplanets(
  req: Request<{}, unknown, unknown, ConsultaExoplanetas>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tipoPlaneta, zonaHabitable, metodoDescubrimiento, buscar } = req.query;

    // Solo se añaden al filtro los parámetros que vienen en la URL
    const filtro: FilterQuery<IExoplanet> = {};
    if (tipoPlaneta) filtro.tipoPlaneta = tipoPlaneta;
    if (metodoDescubrimiento) filtro.metodoDescubrimiento = metodoDescubrimiento;
    if (zonaHabitable !== undefined) filtro.zonaHabitable = zonaHabitable === "true";
    if (buscar) filtro.nombre = { $regex: buscar, $options: "i" };

    // Página mínima 1 y límite máximo 100 para no devolver la colección entera
    const pagina = Math.max(parseInt(req.query.pagina ?? "", 10) || 1, 1);
    const limite = Math.min(parseInt(req.query.limite ?? "", 10) || 50, 100);

    const exoplanetas = await Exoplanet.find(filtro)
      .populate("fuentePrincipal", "titulo autores anio doi")
      .populate("creadoPor", "nombre institucion")
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite);

    res.status(200).json(exoplanetas);
  } catch (err) {
    next(err);
  }
}

// GET /api/exoplanets/:id: detalle con más campos de la fuente que el listado
export async function getExoplanet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id)
      .populate("fuentePrincipal", "titulo autores publicacion anio doi url")
      .populate("creadoPor", "nombre institucion");

    if (!exoplaneta) {
      res.status(404).json({ mensaje: "Exoplaneta no encontrado" });
      return;
    }
    res.status(200).json(exoplaneta);
  } catch (err) {
    next(err);
  }
}

// POST /api/exoplanets: las validaciones las hace el esquema de Mongoose
export async function createExoplanet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nuevo = await Exoplanet.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

// PUT /api/exoplanets/:id
export async function updateExoplanet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // new devuelve el documento ya actualizado; runValidators aplica las
    // reglas del esquema, que por defecto solo se ejecutan al crear
    const exoplaneta = await Exoplanet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exoplaneta) {
      res.status(404).json({ mensaje: "Exoplaneta no encontrado" });
      return;
    }
    res.status(200).json(exoplaneta);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/exoplanets/:id
export async function deleteExoplanet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findByIdAndDelete(req.params.id);
    if (!exoplaneta) {
      res.status(404).json({ mensaje: "Exoplaneta no encontrado" });
      return;
    }
    res.status(200).json({ mensaje: "Exoplaneta eliminado", id: req.params.id });
  } catch (err) {
    next(err);
  }
}
