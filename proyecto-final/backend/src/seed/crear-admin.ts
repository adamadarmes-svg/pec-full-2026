import dns from "node:dns";
import mongoose from "mongoose";
import { ENV } from "../config/env";
import { connectDB } from "../config/db";
import { logger } from "../config/logger";
import { User } from "../models/user-model";

// hice este script porque los usuarios importados tienen contraseñas que nadie conoce y nadie podía entrar como admin

// uso los mismos dns públicos que en seed.ts para conectar desde local
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// puse la misma longitud mínima que en el registro
const LONGITUD_MINIMA_PASSWORD = 6;

async function crearAdmin(): Promise<void> {
  try {
    // valido antes de conectar para no abrir una conexión en balde
    const email = ENV.ADMIN_EMAIL?.trim().toLowerCase();
    const password = ENV.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error("faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env.");
    }
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
      throw new Error(`ADMIN_PASSWORD necesita al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`);
    }

    await connectDB(ENV.MONGODB_URI);

    const existente = await User.findOne({ email });
    if (existente) {
      // uso save() porque solo así se ejecuta el hook que hashea la contraseña
      existente.rol = "admin";
      existente.activo = true;
      existente.password = password;
      await existente.save();
      logger.info(`${email} promocionado a administrador, contraseña actualizada.`);
    } else {
      await User.create({
        nombre: "Administrador",
        email,
        password,
        rol: "admin",
        institucion: "EXO-ARCHIVE",
      });
      logger.info(`administrador ${email} creado.`);
    }
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      // solo muestro campos y mensajes porque el error completo podría llevar la contraseña
      const detalle = Object.entries(err.errors)
        .map(([campo, error]) => `${campo}: ${error.message}`)
        .join("; ");
      logger.error(`datos no válidos: ${detalle}`);
    } else {
      const mensaje = err instanceof Error ? err.message : String(err);
      logger.error(`no se pudo crear el administrador: ${mensaje}`);
    }
    // uso exitCode para que el finally llegue a cerrar la conexión
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

crearAdmin();
