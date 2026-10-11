import { NextFunction, Request, Response } from "express";
import { Observation } from "../models/observation-model";
import { Exoplanet } from "../models/exoplanet-model";
import { esAutorOAdmin, exigirUsuario } from "../middlewares/auth-middleware";
import { responderError } from "../utils/responder";

function noEncontrada(res: Response): void {
  responderError(res, 404, "Not Found", "Observación no encontrada");
}

function exoplanetaNoEncontrado(res: Response): void {
  responderError(res, 404, "Not Found", "El exoplaneta indicado no existe.");
}

// GET /api/exoplanets/:exoplanetaId/observations (con opcional).
// Las ocultas solo las ve un administrador, que es quien modera.
export async function listarObservaciones(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { exoplanetaId } = req.params;
    if (!(await Exoplanet.exists({ _id: exoplanetaId }))) {
      exoplanetaNoEncontrado(res);
      return;
    }

    const esAdmin = req.usuario?.rol === "admin";
    const observaciones = await Observation.find({
      exoplaneta: exoplanetaId,
      ...(esAdmin ? {} : { visible: true }),
    })
      .populate("autor", "nombre institucion")
      .sort({ createdAt: -1 });

    res.status(200).json(observaciones);
  } catch (err) {
    next(err);
  }
}

// POST /api/exoplanets/:exoplanetaId/observations (protegida)
export async function crearObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = exigirUsuario(req);
    const { exoplanetaId } = req.params;
    if (!(await Exoplanet.exists({ _id: exoplanetaId }))) {
      exoplanetaNoEncontrado(res);
      return;
    }

    // Solo los campos de contenido: el exoplaneta sale de la URL, el autor del
    // token, y visible se queda en su valor por defecto
    const { contenido, tipo, anioObservacion, instrumento } = req.body;
    const observacion = await Observation.create({
      contenido,
      tipo,
      anioObservacion,
      instrumento,
      exoplaneta: exoplanetaId,
      autor: usuario._id,
    });
    await observacion.populate("autor", "nombre institucion");

    res.status(201).json(observacion);
  } catch (err) {
    next(err);
  }
}

// PUT /api/observations/:id (protegida): solo su autor o un administrador
export async function actualizarObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const observacion = await Observation.findById(req.params.id);
    if (!observacion) {
      noEncontrada(res);
      return;
    }
    if (!esAutorOAdmin(req, observacion.autor)) {
      responderError(res, 403, "Forbidden", "Solo el autor de la observación o un administrador pueden modificarla.");
      return;
    }

    // exoplaneta, autor y visible no se cambian desde aquí
    const { contenido, tipo, anioObservacion, instrumento } = req.body;
    if (contenido !== undefined) observacion.contenido = contenido;
    if (tipo !== undefined) observacion.tipo = tipo;
    if (anioObservacion !== undefined) observacion.anioObservacion = anioObservacion;
    if (instrumento !== undefined) observacion.instrumento = instrumento;

    await observacion.save();
    await observacion.populate("autor", "nombre institucion");
    res.status(200).json(observacion);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/observations/:id (protegida)
export async function eliminarObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const observacion = await Observation.findById(req.params.id);
    if (!observacion) {
      noEncontrada(res);
      return;
    }

    // Además del autor de la observación y del admin, puede borrarla el autor
    // del exoplaneta: así modera lo que otros publican en su registro
    let permitido = esAutorOAdmin(req, observacion.autor);
    if (!permitido) {
      const exoplaneta = await Exoplanet.findById(observacion.exoplaneta).select("creadoPor");
      permitido = esAutorOAdmin(req, exoplaneta?.creadoPor);
    }
    if (!permitido) {
      responderError(
        res,
        403,
        "Forbidden",
        "Solo el autor de la observación, el autor del exoplaneta o un administrador pueden eliminarla."
      );
      return;
    }

    await observacion.deleteOne();
    res.status(200).json({ mensaje: "Observación eliminada", id: String(observacion._id) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/observations/:id/ocultar (solo admin): fija visible, false por
// defecto. Ocultar en vez de borrar permite revertir la moderación.
export async function ocultarObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const visible = typeof req.body?.visible === "boolean" ? req.body.visible : false;
    const observacion = await Observation.findByIdAndUpdate(req.params.id, { visible }, { new: true });
    if (!observacion) {
      noEncontrada(res);
      return;
    }
    res.status(200).json(observacion);
  } catch (err) {
    next(err);
  }
}
