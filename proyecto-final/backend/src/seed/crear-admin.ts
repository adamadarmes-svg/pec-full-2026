import dns from "node:dns";
import mongoose from "mongoose";
import { ENV } from "../config/env";
import { connectDB } from "../config/db";
import { logger } from "../config/logger";
import { User } from "../models/user-model";

// Crea el administrador o promociona a un usuario existente. Hace falta
// porque los usuarios actuales tienen contraseñas bcrypt que nadie conoce,
// así que sin este script nadie podría iniciar sesión como admin.
// La contraseña viene de ADMIN_PASSWORD y nunca se escribe en los logs.

// Mismos DNS públicos que seed.ts para resolver mongodb+srv en local
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// Igual que la exigida en /api/auth/registro
const LONGITUD_MINIMA_PASSWORD = 6;

async function crearAdmin(): Promise<void> {
  try {
    // Se valida antes de conectar para no abrir conexión en balde
    const email = ENV.ADMIN_EMAIL?.trim().toLowerCase();
    const password = ENV.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env. Defínelas y vuelve a ejecutar el script.");
    }
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
      throw new Error(`ADMIN_PASSWORD debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`);
    }

    await connectDB(ENV.MONGODB_URI);

    const existente = await User.findOne({ email });
    if (existente) {
      // Se guarda con save() y no con updateOne porque solo save() dispara el
      // hook pre("save") que hashea la contraseña
      existente.rol = "admin";
      existente.activo = true;
      existente.password = password;
      await existente.save();
      logger.info(`Usuario ${email} promocionado a administrador. Contraseña actualizada.`);
    } else {
      await User.create({
        nombre: "Administrador",
        email,
        password,
        rol: "admin",
        institucion: "EXO-ARCHIVE",
      });
      logger.info(`Administrador ${email} creado.`);
    }
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      // Solo los nombres de campo y los mensajes: el objeto completo incluye
      // los valores rechazados, y entre ellos podría estar la contraseña
      const detalle = Object.entries(err.errors)
        .map(([campo, error]) => `${campo}: ${error.message}`)
        .join("; ");
      logger.error(`No se pudo guardar el administrador por datos no válidos. ${detalle}`);
    } else {
      const mensaje = err instanceof Error ? err.message : String(err);
      logger.error(`Error al crear el administrador: ${mensaje}`);
    }
    // exitCode en lugar de process.exit(1) para que el finally cierre la conexión
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

crearAdmin();
