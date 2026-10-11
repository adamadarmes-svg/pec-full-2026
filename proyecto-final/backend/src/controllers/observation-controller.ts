import { NextFunction, Request, Response } from "express";
import { Observation } from "../models/observation-model";
import { Exoplanet } from "../models/exoplanet-model";
import { esAutorOAdmin, exigirUsuario } from "../middlewares/auth-middleware";
import { responderError } from "../utils/responder";

function noEncontrada(res: Response): void {
  responderError(res, 404, "Not Found", "observación no encontrada.");
}

function exoplanetaNoEncontrado(res: Response): void {
  responderError(res, 404, "Not Found", "ese exoplaneta no existe.");
}

// las ocultas solo las ve el admin porque es quien modera
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

// uso soloAdmin para que un investigador reciba 403 y no una lista vacía que parezca que no hay nada
export async function listarObservacionesModeracion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { visible } = req.query;
    const filtro = visible === "false" ? { visible: false } : visible === "true" ? { visible: true } : {};

    const observaciones = await Observation.find(filtro)
      .populate("autor", "nombre institucion")
      .populate("exoplaneta", "nombre")
      .sort({ createdAt: -1 });

    res.status(200).json(observaciones);
  } catch (err) {
    next(err);
  }
}

export async function crearObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = exigirUsuario(req);
    const { exoplanetaId } = req.params;
    if (!(await Exoplanet.exists({ _id: exoplanetaId }))) {
      exoplanetaNoEncontrado(res);
      return;
    }

    // el exoplaneta sale de la url y el autor del token para que no se puedan falsear
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

export async function actualizarObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const observacion = await Observation.findById(req.params.id);
    if (!observacion) {
      noEncontrada(res);
      return;
    }
    if (!esAutorOAdmin(req, observacion.autor)) {
      responderError(res, 403, "Forbidden", "solo su autor o un administrador pueden editarla.");
      return;
    }

    // no dejo cambiar visible aquí porque eso es moderación y tiene su ruta
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

export async function eliminarObservacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const observacion = await Observation.findById(req.params.id);
    if (!observacion) {
      noEncontrada(res);
      return;
    }

    // dejo borrar también al autor del exoplaneta para que pueda moderar su registro
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
        "solo su autor, el del exoplaneta o un administrador pueden eliminarla."
      );
      return;
    }

    await observacion.deleteOne();
    res.status(200).json({ mensaje: "observación eliminada", id: String(observacion._id) });
  } catch (err) {
    next(err);
  }
}

// oculto en vez de borrar para poder deshacerlo
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
