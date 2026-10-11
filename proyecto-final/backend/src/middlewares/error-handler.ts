import { ErrorRequestHandler } from "express";
import { ENV } from "../config/env";
import { RespuestaError } from "../types";

// Middleware de errores: Express lo reconoce por tener 4 parámetros, por eso
// next se declara aunque no se use. Traduce los errores de Mongoose a códigos
// HTTP comprensibles en lugar de devolver siempre 500.
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  // El stack ayuda a depurar en local, pero en producción revelaría detalles internos
  const responder = (status: number, error: string, mensaje: string): void => {
    const cuerpo: RespuestaError = { error, mensaje };
    if (ENV.NODE_ENV !== "production") cuerpo.stack = err.stack;
    res.status(status).json(cuerpo);
  };

  // ID con formato que no es un ObjectId válido
  if (err.name === "CastError") {
    return responder(400, "Bad Request", "ID no válido.");
  }

  // Datos que no cumplen las reglas del esquema
  if (err.name === "ValidationError") {
    return responder(400, "Validation Error", err.message);
  }

  // Violación de un índice único de MongoDB (email, nombre, doi...)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0];
    return responder(409, "Conflict", `Ya existe un registro con ese valor en el campo '${campo}'.`);
  }

  responder(err.status || 500, "Internal Server Error", err.message || "Ha ocurrido un error inesperado.");
};

export default errorHandler;
