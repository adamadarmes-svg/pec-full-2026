import { Response } from "express";
import { RespuestaError } from "../types";

// usé el mismo formato que el errorHandler para que el cliente trate igual todos los errores
export function responderError(res: Response, status: number, error: string, mensaje: string): void {
  const cuerpo: RespuestaError = { error, mensaje };
  res.status(status).json(cuerpo);
}
