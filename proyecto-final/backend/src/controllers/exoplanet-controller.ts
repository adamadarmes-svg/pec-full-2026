import { NextFunction, Request, Response } from "express";
import { FilterQuery, isValidObjectId } from "mongoose";
import { Exoplanet } from "../models/exoplanet-model";
import { Image } from "../models/image-model";
import { Observation } from "../models/observation-model";
import { esAutorOAdmin, exigirUsuario } from "../middlewares/auth-middleware";
import { responderError } from "../utils/responder";
import { IExoplanet } from "../types";

// los tipé como texto porque los parámetros de la url siempre llegan así
interface ConsultaExoplanetas {
  tipoPlaneta?: string;
  tipos?: string;
  zonaHabitable?: string;
  confirmado?: string;
  metodoDescubrimiento?: string;
  buscar?: string;
  anioDesde?: string;
  anioHasta?: string;
  distanciaMax?: string;
  creadoPor?: string;
  pagina?: string;
  limite?: string;
}

// ignoro los valores mal escritos para que no rompan la consulta
function aNumero(valor: string | undefined): number | undefined {
  if (valor === undefined || valor.trim() === "") return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

function noEncontrado(res: Response): void {
  responderError(res, 404, "Not Found", "exoplaneta no encontrado.");
}

export async function listarExoplanetas(
  req: Request<{}, unknown, unknown, ConsultaExoplanetas>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tipoPlaneta, tipos, zonaHabitable, confirmado, metodoDescubrimiento, buscar } = req.query;

    const filtro: FilterQuery<IExoplanet> = {};
    if (tipoPlaneta) filtro.tipoPlaneta = tipoPlaneta;
    // tipos manda sobre tipoPlaneta porque permite elegir varios a la vez
    const listaTipos = tipos?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
    if (listaTipos.length > 0) filtro.tipoPlaneta = { $in: listaTipos };
    if (metodoDescubrimiento) filtro.metodoDescubrimiento = metodoDescubrimiento;
    if (zonaHabitable !== undefined) filtro.zonaHabitable = zonaHabitable === "true";
    if (confirmado !== undefined) filtro.confirmado = confirmado === "true";
    if (buscar) filtro.nombre = { $regex: buscar, $options: "i" };

    const anioDesde = aNumero(req.query.anioDesde);
    const anioHasta = aNumero(req.query.anioHasta);
    if (anioDesde !== undefined || anioHasta !== undefined) {
      const rango: { $gte?: number; $lte?: number } = {};
      if (anioDesde !== undefined) rango.$gte = anioDesde;
      if (anioHasta !== undefined) rango.$lte = anioHasta;
      filtro.anioDescubrimiento = rango;
    }

    const distanciaMax = aNumero(req.query.distanciaMax);
    if (distanciaMax !== undefined) filtro.distancia = { $lte: distanciaMax };

    // valido el id antes porque mal formado daba un 500 cuando el error es del usuario
    const { creadoPor } = req.query;
    if (creadoPor !== undefined) {
      if (!isValidObjectId(creadoPor)) {
        responderError(res, 400, "Bad Request", "creadoPor no es un id de usuario válido.");
        return;
      }
      filtro.creadoPor = creadoPor;
    }

    // limité a 100 para que nadie pueda pedir toda la colección de golpe
    const pagina = Math.max(parseInt(req.query.pagina ?? "", 10) || 1, 1);
    const limite = Math.min(parseInt(req.query.limite ?? "", 10) || 50, 100);

    // no traigo los datos de la imagen en el listado porque con varias en base64 pasaba de los 4,5 mb de vercel
    const [exoplanetas, total] = await Promise.all([
      Exoplanet.find(filtro)
        .populate("fuentePrincipal", "titulo autores anio doi")
        .populate("creadoPor", "nombre institucion")
        .populate("imagenPrincipal", "titulo url origen")
        .sort({ nombre: 1 })
        .skip((pagina - 1) * limite)
        .limit(limite),
      Exoplanet.countDocuments(filtro),
    ]);

    res.status(200).json({
      exoplanetas,
      paginacion: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    });
  } catch (err) {
    next(err);
  }
}

// en el detalle sí traigo los datos porque es un solo documento
export async function obtenerExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id)
      .populate("fuentePrincipal", "titulo autores publicacion anio doi url")
      .populate("creadoPor", "nombre institucion")
      .populate("imagenPrincipal", "titulo url datos origen");

    if (!exoplaneta) {
      noEncontrado(res);
      return;
    }
    res.status(200).json(exoplaneta);
  } catch (err) {
    next(err);
  }
}

// no valido a mano porque ya lo hace el esquema
export async function crearExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = exigirUsuario(req);
    // creadoPor sale del token para que nadie atribuya un registro a otro y quito imagenPrincipal porque un exoplaneta nuevo no tiene imágenes
    const { creadoPor, imagenPrincipal, ...datos } = req.body;

    const nuevo = await Exoplanet.create({ ...datos, creadoPor: usuario._id });
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

export async function actualizarExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id);
    if (!exoplaneta) {
      noEncontrado(res);
      return;
    }
    if (!esAutorOAdmin(req, exoplaneta.creadoPor)) {
      responderError(res, 403, "Forbidden", "solo su autor o un administrador pueden editarlo.");
      return;
    }

    // no dejo cambiar creadoPor porque cambiaría quién puede editarlo
    const { creadoPor, imagenPrincipal, ...cambios } = req.body;

    // exijo que la imagen esté publicada para que nadie se salte la moderación poniendo la suya como principal
    if (imagenPrincipal !== undefined) {
      if (imagenPrincipal === null || imagenPrincipal === "") {
        cambios.imagenPrincipal = null;
      } else {
        const imagen = await Image.findById(imagenPrincipal).select("exoplaneta publicada");
        if (!imagen || String(imagen.exoplaneta) !== String(exoplaneta._id)) {
          responderError(res, 400, "Bad Request", "esa imagen no es de este exoplaneta.");
          return;
        }
        if (!imagen.publicada) {
          responderError(
            res,
            400,
            "Bad Request",
            "esa imagen aún no está publicada. un administrador tiene que aprobarla."
          );
          return;
        }
        cambios.imagenPrincipal = imagen._id;
      }
    }

    // convierto null en $unset para poder borrar un dato mal puesto sin que la api devuelva null en un número
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};
    for (const [campo, valor] of Object.entries(cambios)) {
      if (valor === null && campo !== "imagenPrincipal") {
        $unset[campo] = 1;
      } else {
        $set[campo] = valor;
      }
    }
    const operacion = {
      ...(Object.keys($set).length > 0 && { $set }),
      ...(Object.keys($unset).length > 0 && { $unset }),
    };

    // activé runValidators porque si no al editar se podía guardar una masa negativa
    const actualizado = await Exoplanet.findByIdAndUpdate(exoplaneta._id, operacion, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
}

export async function eliminarExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id);
    if (!exoplaneta) {
      noEncontrado(res);
      return;
    }
    if (!esAutorOAdmin(req, exoplaneta.creadoPor)) {
      responderError(res, 403, "Forbidden", "solo su autor o un administrador pueden eliminarlo.");
      return;
    }

    // borro antes imágenes y observaciones para que no queden huérfanas
    const [imagenes, observaciones] = await Promise.all([
      Image.deleteMany({ exoplaneta: exoplaneta._id }),
      Observation.deleteMany({ exoplaneta: exoplaneta._id }),
    ]);
    await exoplaneta.deleteOne();

    res.status(200).json({
      mensaje: "exoplaneta eliminado",
      id: String(exoplaneta._id),
      imagenesBorradas: imagenes.deletedCount,
      observacionesBorradas: observaciones.deletedCount,
    });
  } catch (err) {
    next(err);
  }
}
