import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import exoplanetRoutes from "./exoplanet-routes";
import userRoutes from "./user-routes";
import sourceRoutes from "./source-routes";
import { notFound } from "../middlewares/not-found";
import { errorHandler } from "../middlewares/error-handler";

// Router raíz de la API: agrupa todos los recursos bajo un único punto de
// montaje (/api en app.ts), de modo que app.ts no conoce las rutas concretas.
const router = Router();

// Mensaje de bienvenida con el mapa de endpoints. Se exporta para que app.ts
// lo reutilice en GET / y no se rompa la URL raíz ya desplegada.
export function mostrarBienvenida(req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    mensaje: "API de EXO-ARCHIVE en funcionamiento",
    endpoints: {
      exoplanets: "/api/exoplanets",
      users: "/api/users",
      sources: "/api/sources",
      health: "/api/health",
    },
  });
}

router.get("/", mostrarBienvenida);

// Estado del servidor y de la conexión a MongoDB, útil para comprobar el despliegue
router.get("/health", (req: Request, res: Response) => {
  // Índices de mongoose.connection.readyState
  const estados = ["desconectado", "conectado", "conectando", "desconectando"];
  res.status(200).json({
    ok: true,
    servidor: "activo",
    baseDeDatos: estados[mongoose.connection.readyState] || "desconocido",
    fecha: new Date().toISOString(),
  });
});

router.use("/exoplanets", exoplanetRoutes);
router.use("/users", userRoutes);
router.use("/sources", sourceRoutes);

// Los middlewares de 404 y 500 van al final del router porque Express los
// ejecuta en orden: el 404 solo debe saltar si ninguna ruta de la API
// coincidió, y el de errores recoge lo que los controladores pasan con
// next(err). Montarlos aquí hace que la API sea autónoma y responda siempre
// en JSON, con independencia de cómo se monte en app.ts.
router.use(notFound);
router.use(errorHandler);

export default router;
