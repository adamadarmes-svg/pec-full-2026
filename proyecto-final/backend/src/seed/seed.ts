import dns from "node:dns";
import mongoose, { Types } from "mongoose";
import { ENV } from "../config/env";
import { connectDB } from "../config/db";
import { logger } from "../config/logger";
import { Exoplanet } from "../models/exoplanet-model";
import { Observation } from "../models/observation-model";
import { Source } from "../models/source-model";
import { User } from "../models/user-model";
import { EXOPLANETAS_INICIALES, FUENTES_INICIALES, OBSERVACIONES_EJEMPLO } from "./datos-iniciales";

// el seed nunca borra y solo llena colecciones vacías para poder correrlo sobre producción sin miedo, primero npm run crear-admin y luego npm run seed

// fuerzo dns públicos porque desde local algunos routers no resuelven mongodb+srv
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// todo va a nombre del admin para no poner textos a nombre de usuarios reales
async function buscarAdministrador(): Promise<Types.ObjectId> {
  const email = ENV.ADMIN_EMAIL?.trim().toLowerCase();
  const admin = email ? await User.findOne({ email, rol: "admin" }).select("_id") : null;
  if (!admin) {
    throw new Error(
      "no existe el administrador de ADMIN_EMAIL. ejecuta antes npm run crear-admin."
    );
  }
  return admin._id as Types.ObjectId;
}

// primero las fuentes porque los exoplanetas las necesitan
async function sembrarFuentes(): Promise<number> {
  if ((await Source.countDocuments()) > 0) return 0;
  const creadas = await Source.insertMany(FUENTES_INICIALES);
  return creadas.length;
}

// busco la fuente por doi porque en una base nueva el ObjectId sería otro
async function sembrarExoplanetas(adminId: Types.ObjectId): Promise<number> {
  if ((await Exoplanet.countDocuments()) > 0) return 0;

  const fuentes = await Source.find({ doi: { $exists: true } }).select("doi").lean();
  const idPorDoi = new Map(fuentes.map((fuente) => [fuente.doi, fuente._id]));

  const documentos = EXOPLANETAS_INICIALES.map(({ fuente, ...datos }) => {
    const fuentePrincipal = fuente ? idPorDoi.get(fuente.doi) : undefined;
    // si no encuentro la fuente sigo sin ella y aviso, para no parar todo el seed
    if (fuente && !fuentePrincipal) {
      logger.warn(`no hay fuente con doi ${fuente.doi}: ${datos.nombre} se crea sin ella.`);
    }
    // no pongo imagenPrincipal porque en una base nueva no hay imágenes
    return { ...datos, fuentePrincipal, creadoPor: adminId };
  });

  const creados = await Exoplanet.insertMany(documentos);
  return creados.length;
}

// las pongo a nombre del admin para no atribuirlas a usuarios reales
async function sembrarObservaciones(adminId: Types.ObjectId): Promise<number> {
  if ((await Observation.countDocuments()) > 0) return 0;

  const exoplanetas = await Exoplanet.find().sort({ nombre: 1 }).select("_id").lean();
  if (exoplanetas.length === 0) {
    logger.warn("no hay exoplanetas: no se crean observaciones de ejemplo.");
    return 0;
  }

  const creadas = await Observation.insertMany(
    OBSERVACIONES_EJEMPLO.map((observacion, i) => ({
      ...observacion,
      exoplaneta: exoplanetas[i % exoplanetas.length]._id,
      autor: adminId,
    }))
  );
  return creadas.length;
}

function resumen(coleccion: string, creados: number): string {
  return creados > 0 ? `${coleccion}: ${creados} creados` : `${coleccion}: ya tenía datos, no se ha tocado`;
}

async function seed(): Promise<void> {
  try {
    await connectDB(ENV.MONGODB_URI);

    // busco al admin lo primero para parar antes de escribir nada
    const adminId = await buscarAdministrador();

    const fuentes = await sembrarFuentes();
    const exoplanetas = await sembrarExoplanetas(adminId);
    const observaciones = await sembrarObservaciones(adminId);

    logger.info("seed completado");
    logger.info(resumen("sources", fuentes));
    logger.info(resumen("exoplanets", exoplanetas));
    logger.info(resumen("observations", observaciones));
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    logger.error(`error en el seed: ${mensaje}`, { stack: err instanceof Error ? err.stack : undefined });
    // uso exitCode porque exit() cortaba antes de cerrar la conexión
    process.exitCode = 1;
  } finally {
    // cierro la conexión porque si no el proceso se quedaba abierto
    await mongoose.connection.close();
  }
}

seed();
