import { NextFunction, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Exoplanet } from "../models/exoplanet-model";
import { Image } from "../models/image-model";
import { Observation } from "../models/observation-model";
import { esAutorOAdmin, exigirUsuario } from "../middlewares/auth-middleware";
import { responderError } from "../utils/responder";
import { IExoplanet } from "../types";

// Parámetros de consulta admitidos en el listado. Llegan siempre como texto.
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
  pagina?: string;
  limite?: string;
}

// Convierte un parámetro de texto en número, o undefined si no es válido,
// para que un valor mal escrito se ignore en vez de romper la consulta
function aNumero(valor: string | undefined): number | undefined {
  if (valor === undefined || valor.trim() === "") return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

function noEncontrado(res: Response): void {
  responderError(res, 404, "Not Found", "Exoplaneta no encontrado");
}

// GET /api/exoplanets: listado público con filtros opcionales y paginación
export async function listarExoplanetas(
  req: Request<{}, unknown, unknown, ConsultaExoplanetas>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tipoPlaneta, tipos, zonaHabitable, confirmado, metodoDescubrimiento, buscar } = req.query;

    // Solo se añaden al filtro los parámetros que vienen en la URL
    const filtro: FilterQuery<IExoplanet> = {};
    if (tipoPlaneta) filtro.tipoPlaneta = tipoPlaneta;
    // tipos admite varios valores separados por comas y, si llega, manda sobre tipoPlaneta
    const listaTipos = tipos?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
    if (listaTipos.length > 0) filtro.tipoPlaneta = { $in: listaTipos };
    if (metodoDescubrimiento) filtro.metodoDescubrimiento = metodoDescubrimiento;
    if (zonaHabitable !== undefined) filtro.zonaHabitable = zonaHabitable === "true";
    if (confirmado !== undefined) filtro.confirmado = confirmado === "true";
    if (buscar) filtro.nombre = { $regex: buscar, $options: "i" };

    // Rango de años: se admite solo el inicio, solo el final o ambos
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

    // Página mínima 1 y límite máximo 100 para no devolver la colección entera
    const pagina = Math.max(parseInt(req.query.pagina ?? "", 10) || 1, 1);
    const limite = Math.min(parseInt(req.query.limite ?? "", 10) || 50, 100);

    // El total se cuenta en paralelo con el mismo filtro para calcular las páginas.
    // De imagenPrincipal no se trae datos (Base64): con varias imágenes subidas
    // la respuesta superaría el límite de 4,5 MB de Vercel. El frontend usa
    // url o /api/images/:id/archivo según el origen.
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

// GET /api/exoplanets/:id: detalle público, aquí sí con los datos de la imagen
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

// POST /api/exoplanets (protegida): las validaciones las hace el esquema
export async function crearExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = exigirUsuario(req);
    // creadoPor sale siempre del token: si se aceptara del body, cualquiera
    // podría atribuir el registro a otro usuario. imagenPrincipal también se
    // descarta porque ninguna imagen puede pertenecer aún a un exoplaneta nuevo.
    const { creadoPor, imagenPrincipal, ...datos } = req.body;

    const nuevo = await Exoplanet.create({ ...datos, creadoPor: usuario._id });
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

// PUT /api/exoplanets/:id (protegida): solo su autor o un administrador
export async function actualizarExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id);
    if (!exoplaneta) {
      noEncontrado(res);
      return;
    }
    if (!esAutorOAdmin(req, exoplaneta.creadoPor)) {
      responderError(res, 403, "Forbidden", "Solo el autor del registro o un administrador pueden modificarlo.");
      return;
    }

    // creadoPor no se puede reasignar desde el body
    const { creadoPor, imagenPrincipal, ...cambios } = req.body;

    // La imagen principal debe existir, pertenecer a este exoplaneta y estar
    // publicada. Sin comprobar lo último, un investigador podría poner como
    // principal una imagen suya sin aprobar y saltarse la moderación del admin.
    // null o cadena vacía quitan la imagen principal.
    if (imagenPrincipal !== undefined) {
      if (imagenPrincipal === null || imagenPrincipal === "") {
        cambios.imagenPrincipal = null;
      } else {
        const imagen = await Image.findById(imagenPrincipal).select("exoplaneta publicada");
        if (!imagen || String(imagen.exoplaneta) !== String(exoplaneta._id)) {
          responderError(res, 400, "Bad Request", "La imagen principal debe ser una imagen existente de este exoplaneta.");
          return;
        }
        if (!imagen.publicada) {
          responderError(
            res,
            400,
            "Bad Request",
            "La imagen todavía no está publicada. Un administrador debe aprobarla antes de usarla como principal."
          );
          return;
        }
        cambios.imagenPrincipal = imagen._id;
      }
    }

    // new devuelve el documento ya actualizado; runValidators aplica las
    // reglas del esquema, que por defecto solo se ejecutan al crear
    const actualizado = await Exoplanet.findByIdAndUpdate(exoplaneta._id, cambios, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/exoplanets/:id (protegida): solo su autor o un administrador
export async function eliminarExoplaneta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id);
    if (!exoplaneta) {
      noEncontrado(res);
      return;
    }
    if (!esAutorOAdmin(req, exoplaneta.creadoPor)) {
      responderError(res, 403, "Forbidden", "Solo el autor del registro o un administrador pueden eliminarlo.");
      return;
    }

    // Eliminación en cascada: sin ella quedarían imágenes y observaciones
    // huérfanas apuntando a un exoplaneta que ya no existe. Se borran antes
    // que el exoplaneta para que nunca haya hijos sin padre.
    const [imagenes, observaciones] = await Promise.all([
      Image.deleteMany({ exoplaneta: exoplaneta._id }),
      Observation.deleteMany({ exoplaneta: exoplaneta._id }),
    ]);
    await exoplaneta.deleteOne();

    res.status(200).json({
      mensaje: "Exoplaneta eliminado",
      id: String(exoplaneta._id),
      imagenesBorradas: imagenes.deletedCount,
      observacionesBorradas: observaciones.deletedCount,
    });
  } catch (err) {
    next(err);
  }
}
