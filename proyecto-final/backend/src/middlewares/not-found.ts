import { Request, Response } from "express";

// Se monta después de todas las rutas: si la petición llega aquí es que
// ninguna coincidió, y respondemos 404 en JSON en vez del HTML de Express.
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not Found",
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.`,
  });
}

export default notFound;
