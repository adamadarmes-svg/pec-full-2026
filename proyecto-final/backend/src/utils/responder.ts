import { Response } from "express";
import { RespuestaError } from "../types";

// Respuesta de error con el mismo formato { error, mensaje } que usa el
// errorHandler, para que el cliente trate igual todos los errores de la API
export function responderError(res: Response, status: number, error: string, mensaje: string): void {
  const cuerpo: RespuestaError = { error, mensaje };
  res.status(status).json(cuerpo);
}
