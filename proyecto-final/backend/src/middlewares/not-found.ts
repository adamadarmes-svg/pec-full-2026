import { Request, Response } from "express";

// lo monté al final para que solo salte si ninguna ruta coincide y responda en json
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not Found",
    mensaje: `no existe la ruta ${req.method} ${req.originalUrl}.`,
  });
}

export default notFound;
