import { NextFunction, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Image } from "../models/image-model";
import { Exoplanet } from "../models/exoplanet-model";
import { esAutorOAdmin, exigirUsuario } from "../middlewares/auth-middleware";
import { responderError } from "../utils/responder";
import { FormatoImagen, IImage } from "../types";

// Límite de la cadena Base64 que viaja en la petición. Vercel rechaza
// cualquier petición de más de 4,5 MB antes de que llegue a Express; con
// 4000 KB queda margen para el resto del JSON y se puede dar un mensaje claro.
const LIMITE_BASE64_KB = 4000;

// Solo formatos rasterizados. SVG queda fuera a propósito: puede contener
// scripts y /archivo lo serviría desde el dominio de la API.
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

// Qué imágenes puede ver quien hace la petición:
// anónimo -> solo publicadas; investigador -> publicadas + las suyas; admin -> todas
function filtroVisibilidad(req: Request): FilterQuery<IImage> {
  const usuario = req.usuario;
  if (!usuario) return { publicada: true };
  if (usuario.rol === "admin") return {};
  return { $or: [{ publicada: true }, { subidaPor: usuario._id }] };
}

function puedeVer(req: Request, imagen: IImage): boolean {
  return imagen.publicada || esAutorOAdmin(req, imagen.subidaPor);
}

// 404 también para imágenes sin publicar que el usuario no puede ver: un 403
// confirmaría que existen
function noEncontrada(res: Response): void {
  responderError(res, 404, "Not Found", "Imagen no encontrada");
}

// Quita el Base64 de las respuestas de escritura: el cliente ya lo tiene y
// devolverlo duplicaría varios MB de tráfico
function sinDatos(imagen: IImage): Omit<IImage, "datos"> {
  const { datos, ...resto } = imagen.toObject();
  return resto;
}

// Tamaño real en KB de la imagen codificada en Base64: cada 4 caracteres son
// 3 bytes, menos el relleno "=" del final
function calcularTamanoKb(base64: string): number {
  const relleno = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const bytes = (base64.length * 3) / 4 - relleno;
  return Math.round(bytes / 1024);
}

// GET /api/images (con opcional): filtra por exoplaneta si viene ?exoplaneta=
export async function listarImagenes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtro = filtroVisibilidad(req);
    if (typeof req.query.exoplaneta === "string") filtro.exoplaneta = req.query.exoplaneta;

    // datos nunca viaja en listados: con varias subidas se superarían los 4,5 MB
    // de respuesta de Vercel. Para mostrarla se usa url o /:id/archivo.
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

// GET /api/images/:id (con opcional): detalle completo, incluido el Base64
export async function obtenerImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // La visibilidad se comprueba antes del populate: después subidaPor
    // sería un documento y no un id, y la comparación de autoría fallaría
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

// GET /api/images/:id/archivo (con opcional): la imagen subida en binario,
// para usarla directamente en <img src="..."> desde el frontend
export async function obtenerArchivoImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imagen = await Image.findById(req.params.id);
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    if (imagen.origen !== "subida") {
      responderError(res, 400, "Bad Request", "Esta imagen es un enlace externo: usa su campo url.");
      return;
    }
    const partes = PATRON_DATA_URI.exec(imagen.datos ?? "");
    if (!partes) {
      responderError(res, 500, "Internal Server Error", "Los datos guardados de la imagen no son válidos.");
      return;
    }

    // helmet pone Cross-Origin-Resource-Policy: same-origin en todas las
    // respuestas, y con ella el navegador bloquea la imagen cuando la pide un
    // <img> del frontend, que está en otro dominio, sin mostrar ningún error.
    // Se relaja solo en esta ruta, que sirve contenido pensado para incrustarse.
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // Las publicadas se pueden cachear; las privadas no, porque solo las ve su autor
    res.setHeader("Cache-Control", imagen.publicada ? "public, max-age=86400" : "private, no-store");
    res.type(`image/${partes[1]}`);
    res.status(200).send(Buffer.from(partes[2], "base64"));
  } catch (err) {
    next(err);
  }
}

// POST /api/images (protegida)
export async function crearImagen(
  req: Request<{}, unknown, CuerpoImagen>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const usuario = exigirUsuario(req);
    const { titulo, descripcion, origen, datos, url, formato, creditoAutor, exoplaneta } = req.body;

    if (!exoplaneta || !(await Exoplanet.exists({ _id: exoplaneta }))) {
      responderError(res, 404, "Not Found", "El exoplaneta indicado no existe.");
      return;
    }

    // Solo se copian los campos permitidos: subidaPor sale del token y
    // publicada empieza siempre en false, porque solo un admin publica
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
          "datos debe ser una imagen en Base64 con el formato data:image/(jpeg|png|webp|gif);base64,..."
        );
        return;
      }
      if (datos.length / 1024 > LIMITE_BASE64_KB) {
        responderError(
          res,
          413,
          "Payload Too Large",
          `La imagen supera el máximo de ${LIMITE_BASE64_KB} KB en Base64 (unos 3 MB de imagen). El límite lo impone la plataforma de despliegue, que no acepta peticiones de más de 4,5 MB.`
        );
        return;
      }
      // El formato se deduce de los propios datos para que no pueda contradecirlos
      nueva.datos = datos;
      nueva.formato = partes[1];
      nueva.tamanoKb = calcularTamanoKb(partes[2]);
    } else if (origen === "enlace") {
      if (url && !/^https?:\/\//i.test(url)) {
        responderError(res, 400, "Bad Request", "La url de la imagen debe empezar por http:// o https://");
        return;
      }
      nueva.url = url;
      nueva.formato = formato;
    }
    // Si origen falta o no es válido, el esquema lo rechaza con un 400

    const imagen = await Image.create(nueva);
    res.status(201).json(sinDatos(imagen));
  } catch (err) {
    next(err);
  }
}

// PUT /api/images/:id (protegida): solo los campos descriptivos
export async function actualizarImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imagen = await Image.findById(req.params.id);
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    if (!esAutorOAdmin(req, imagen.subidaPor)) {
      responderError(res, 403, "Forbidden", "Solo quien subió la imagen o un administrador pueden modificarla.");
      return;
    }

    // publicada, subidaPor, exoplaneta y el contenido no se cambian aquí:
    // publicar tiene su propia ruta de admin y lo demás define la imagen
    const { titulo, descripcion, creditoAutor } = req.body;
    if (titulo !== undefined) imagen.titulo = titulo;
    if (descripcion !== undefined) imagen.descripcion = descripcion;
    if (creditoAutor !== undefined) imagen.creditoAutor = creditoAutor;

    // save() en lugar de findByIdAndUpdate para que se ejecuten todas las
    // validaciones del esquema, incluida la de coherencia origen/datos/url
    await imagen.save();
    res.status(200).json(sinDatos(imagen));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/images/:id/publicar (solo admin): fija publicada, true por defecto.
// Se fija en vez de alternar para que dos clics seguidos no deshagan la acción.
export async function publicarImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const publicada = typeof req.body?.publicada === "boolean" ? req.body.publicada : true;
    const imagen = await Image.findByIdAndUpdate(req.params.id, { publicada }, { new: true }).select("-datos");
    if (!imagen) {
      noEncontrada(res);
      return;
    }

    // Una imagen despublicada no puede seguir siendo la principal de un
    // exoplaneta público: el populate de imagenPrincipal la seguiría mostrando
    // en el catálogo y la moderación no serviría de nada. El filtro por
    // imagenPrincipal hace que no toque nada si no era la principal.
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

// DELETE /api/images/:id (protegida): solo quien la subió o un administrador
export async function eliminarImagen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const imagen = await Image.findById(req.params.id).select("-datos");
    if (!imagen || !puedeVer(req, imagen)) {
      noEncontrada(res);
      return;
    }
    if (!esAutorOAdmin(req, imagen.subidaPor)) {
      responderError(res, 403, "Forbidden", "Solo quien subió la imagen o un administrador pueden eliminarla.");
      return;
    }

    // Si era la imagen principal de su exoplaneta se quita antes la
    // referencia, para que el exoplaneta no apunte a una imagen inexistente.
    // El filtro por imagenPrincipal hace que no toque nada si no lo era.
    await Exoplanet.updateOne(
      { _id: imagen.exoplaneta, imagenPrincipal: imagen._id },
      { $set: { imagenPrincipal: null } }
    );
    await imagen.deleteOne();

    res.status(200).json({ mensaje: "Imagen eliminada", id: String(imagen._id) });
  } catch (err) {
    next(err);
  }
}
