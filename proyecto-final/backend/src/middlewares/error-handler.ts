import mongoose from "mongoose";
import { ErrorRequestHandler } from "express";
import { ENV } from "../config/env";
import { logger } from "../config/logger";
import { RespuestaError } from "../types";

// next tiene que estar aunque no lo use porque express reconoce así el manejador de errores, y lo monté también en app.ts para cubrir lo que no llega al router
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // solo mando el stack fuera de producción para no enseñar detalles internos
  const responder = (status: number, error: string, mensaje: string): void => {
    // los 4xx van como aviso porque son fallos del cliente y los 5xx con stack para poder investigarlos
    const contexto = `${req.method} ${req.originalUrl} -> ${status}`;
    if (status >= 500) {
      logger.error(`${contexto}: ${err.message}`, { stack: err.stack });
    } else {
      logger.warn(`${contexto}: ${mensaje}`);
    }

    const cuerpo: RespuestaError = { error, mensaje };
    if (ENV.NODE_ENV !== "production") cuerpo.stack = err.stack;
    res.status(status).json(cuerpo);
  };

  // un id mal formado es fallo del cliente, por eso no devuelvo 500
  if (err.name === "CastError") {
    return responder(400, "Bad Request", "id no válido.");
  }

  // respondo solo los mensajes de cada campo porque mongoose antepone un texto en inglés
  if (err instanceof mongoose.Error.ValidationError) {
    const mensajes = Object.values(err.errors).map((detalle) => detalle.message);
    return responder(400, "Validation Error", mensajes.length > 0 ? mensajes.join(" ") : "datos no válidos.");
  }

  // lo separé del 500 porque un origen fuera de CORS_ORIGINS es configuración y no un fallo del servidor
  if (err.name === "CorsError") {
    return responder(403, "Forbidden", err.message);
  }

  // el código 11000 es un duplicado, por eso devuelvo 409
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0];
    return responder(409, "Conflict", `ya existe un registro con ese ${campo}.`);
  }

  responder(err.status || 500, "Internal Server Error", err.message || "error inesperado. prueba otra vez.");
};

export default errorHandler;
