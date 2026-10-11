import { NextFunction, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Image } from "../models/image-model";
import { Exoplanet } from "../models/exoplanet-model";
import { esAutorOAdmin, exigirUsuario } from "../middlewares/auth-middleware";
import { responderError } from "../utils/responder";
import { FormatoImagen, IImage } from "../types";

// puse 4000 kb para dejar margen dentro de los 4,5 mb que admite vercel
const LIMITE_BASE64_KB = 4000;

// dejé fuera svg porque puede llevar scripts
const PATRON_DATA_URI = /^data:image\/(jpeg|png|webp|gif);base64,(.+)$/;

interface CuerpoImagen {
  titulo?: string;
  descripcion?: string;
  origen?: string;
  datos?: string;
  url?: string;
  formato?: FormatoImagen;
  creditoAutor?: string;
  exoplaneta?: string;
}

// cada uno ve lo suyo: anónimo solo publicadas, investigador además las suyas y admin todas
function filtroVisibilidad(req: Request): FilterQuery<IImage> {
  const usuario = req.usuario;
  if (!usuario) return { publicada: true };
  if (usuario.rol === "admin") return {};
  return { $or: [{ publicada: true }, { subidaPor: usuario._id }] };
}

function puedeVer(req: Request, imagen: IImage): boolean {
  return imagen.publicada || esAutorOAdmin(req, imagen.subidaPor);
}

// respondo 404 y no 403 para no confirmar que la imagen existe
function noEncontrada(res: Response): void {
  responderError(res, 404, "Not Found", "imagen no encontrada.");
}

// quito el base64 de la respuesta porque el cliente ya lo tiene
function sinDatos(imagen: IImage): Omit<IImage, "datos"> {
  const { datos, ...resto } = imagen.toObject();
  return resto;
}

// cada 4 caracteres base64 son 3 bytes, por eso calculo así el tamaño real
function calcularTamanoKb(base64: string): number {
  const relleno = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const bytes = (base64.length * 3) / 4 - relleno;
  return Math.round(bytes / 1024);
}

export async function listarImagenes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtro = filtroVisibilidad(req);
    if (typeof req.query.exoplaneta === "string") filtro.exoplaneta = req.query.exoplaneta;

    // nunca mando datos en un listado porque pasaría de los 4,5 mb de vercel
    const imagenes = await Image.find(filtro)
      .select("-datos")
      .populate("subidaPor", "nombre")
      .populate("exoplaneta", "nombre")
      .sort({ createdAt: -1 });

    res.status(200).json(imagenes);
  } catch (err) {
    next(err);
  }
}

export async function obtenerImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // compruebo la autoría antes del populate porque después subidaPor ya no es un id
    const imagen = await Image.findById(req.params.id);
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    await imagen.populate([
      { path: "subidaPor", select: "nombre" },
      { path: "exoplaneta", select: "nombre" },
    ]);
    res.status(200).json(imagen);
  } catch (err) {
    next(err);
  }
}

// hice esta ruta binaria para poder usar la imagen en un img sin pasar el base64 por json
export async function obtenerArchivoImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imagen = await Image.findById(req.params.id);
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    if (imagen.origen !== "subida") {
      responderError(res, 400, "Bad Request", "es un enlace externo: usa su url.");
      return;
    }
    const partes = PATRON_DATA_URI.exec(imagen.datos ?? "");
    if (!partes) {
      responderError(res, 500, "Internal Server Error", "los datos guardados de la imagen están dañados.");
      return;
    }

    // relajé cross-origin-resource-policy solo aquí porque helmet la pone en same-origin y el navegador bloqueaba la imagen en el frontend
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // solo cacheo las publicadas porque las privadas solo las ve su autor
    res.setHeader("Cache-Control", imagen.publicada ? "public, max-age=86400" : "private, no-store");
    res.type(`image/${partes[1]}`);
    res.status(200).send(Buffer.from(partes[2], "base64"));
  } catch (err) {
    next(err);
  }
}

export async function crearImagen(
  req: Request<{}, unknown, CuerpoImagen>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = exigirUsuario(req);
    const { titulo, descripcion, origen, datos, url, formato, creditoAutor, exoplaneta } = req.body;

    if (!exoplaneta || !(await Exoplanet.exists({ _id: exoplaneta }))) {
      responderError(res, 404, "Not Found", "ese exoplaneta no existe.");
      return;
    }

    // copio solo los campos permitidos para que subidaPor y publicada no vengan del body
    const nueva: Partial<Record<keyof IImage, unknown>> = {
      titulo,
      descripcion,
      origen,
      creditoAutor,
      exoplaneta,
      subidaPor: usuario._id,
      publicada: false,
    };

    if (origen === "subida") {
      const partes = PATRON_DATA_URI.exec(datos ?? "");
      if (!datos || !partes) {
        responderError(
          res,
          400,
          "Bad Request",
          "datos debe ser una imagen jpeg, png, webp o gif en base64."
        );
        return;
      }
      if (datos.length / 1024 > LIMITE_BASE64_KB) {
        responderError(
          res,
          413,
          "Payload Too Large",
          `la imagen pasa de ${LIMITE_BASE64_KB} kilobytes codificada, el máximo que admite vercel. redúcela y vuelve a subirla.`
        );
        return;
      }
      // saco el formato de los datos para que no pueda contradecirlos
      nueva.datos = datos;
      nueva.formato = partes[1];
      nueva.tamanoKb = calcularTamanoKb(partes[2]);
    } else if (origen === "enlace") {
      if (url && !/^https?:\/\//i.test(url)) {
        responderError(res, 400, "Bad Request", "la url debe empezar por http:// o https://");
        return;
      }
      nueva.url = url;
      nueva.formato = formato;
    }
    // no lo compruebo aquí porque el esquema ya lo rechaza

    const imagen = await Image.create(nueva);
    res.status(201).json(sinDatos(imagen));
  } catch (err) {
    next(err);
  }
}

export async function actualizarImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imagen = await Image.findById(req.params.id);
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    if (!esAutorOAdmin(req, imagen.subidaPor)) {
      responderError(res, 403, "Forbidden", "solo quien la subió o un administrador pueden editarla.");
      return;
    }

    // solo dejo cambiar el texto porque publicar tiene su propia ruta
    const { titulo, descripcion, creditoAutor } = req.body;
    if (titulo !== undefined) imagen.titulo = titulo;
    if (descripcion !== undefined) imagen.descripcion = descripcion;
    if (creditoAutor !== undefined) imagen.creditoAutor = creditoAutor;

    // uso save() para que pase todas las validaciones del esquema
    await imagen.save();
    res.status(200).json(sinDatos(imagen));
  } catch (err) {
    next(err);
  }
}

// lo fijo en vez de alternarlo para que dos clics seguidos no lo deshagan
export async function publicarImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const publicada = typeof req.body?.publicada === "boolean" ? req.body.publicada : true;
    const imagen = await Image.findByIdAndUpdate(req.params.id, { publicada }, { new: true }).select("-datos");
    if (!imagen) {
      noEncontrada(res);
      return;
    }

    // quito la principal al despublicar porque si no la imagen se seguía viendo en el catálogo
    if (!imagen.publicada) {
      await Exoplanet.updateOne(
        { _id: imagen.exoplaneta, imagenPrincipal: imagen._id },
        { $set: { imagenPrincipal: null } }
      );
    }

    res.status(200).json(imagen);
  } catch (err) {
    next(err);
  }
}

export async function eliminarImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imagen = await Image.findById(req.params.id).select("-datos");
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    if (!esAutorOAdmin(req, imagen.subidaPor)) {
      responderError(res, 403, "Forbidden", "solo quien la subió o un administrador pueden eliminarla.");
      return;
    }

    // quito antes la referencia para que el exoplaneta no apunte a una imagen borrada
    await Exoplanet.updateOne(
      { _id: imagen.exoplaneta, imagenPrincipal: imagen._id },
      { $set: { imagenPrincipal: null } }
    );
    await imagen.deleteOne();

    res.status(200).json({ mensaje: "imagen eliminada", id: String(imagen._id) });
  } catch (err) {
    next(err);
  }
}
