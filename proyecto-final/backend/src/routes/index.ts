import { Request, Response, Router } from "express";
import mongoose from "mongoose";
import exoplanetRoutes from "./exoplanet-routes";
import userRoutes from "./user-routes";
import sourceRoutes from "./source-routes";
import authRoutes from "./auth-routes";
import imageRoutes from "./image-routes";
import observationDirectRoutes from "./observation-direct-routes";
import { notFound } from "../middlewares/not-found";
import { errorHandler } from "../middlewares/error-handler";

// Router raíz de la API: agrupa todos los recursos bajo un único punto de
// montaje (/api en app.ts), de modo que app.ts no conoce las rutas concretas.
const router = Router();

// Mapa de endpoints con su nivel de acceso, para que quien consuma la API
// sepa qué rutas necesitan la cabecera Authorization: Bearer <token>.
// "opcional" = pública, pero muestra más contenido si se envía token.
const ENDPOINTS = {
  auth: {
    "POST /api/auth/registro": "público",
    "POST /api/auth/login": "público",
    "GET /api/auth/perfil": "token",
  },
  exoplanets: {
    "GET /api/exoplanets": "público",
    "GET /api/exoplanets/:id": "público",
    "POST /api/exoplanets": "token",
    "PUT /api/exoplanets/:id": "token (autor o admin)",
    "DELETE /api/exoplanets/:id": "token (autor o admin)",
    "GET /api/exoplanets/:id/observations": "opcional",
    "POST /api/exoplanets/:id/observations": "token",
  },
  observations: {
    "PUT /api/observations/:id": "token (autor o admin)",
    "PATCH /api/observations/:id/ocultar": "token (admin)",
    "DELETE /api/observations/:id": "token (autor, autor del exoplaneta o admin)",
  },
  images: {
    "GET /api/images": "opcional",
    "GET /api/images/:id": "opcional",
    "GET /api/images/:id/archivo": "opcional",
    "POST /api/images": "token",
    "PUT /api/images/:id": "token (autor o admin)",
    "PATCH /api/images/:id/publicar": "token (admin)",
    "DELETE /api/images/:id": "token (autor o admin)",
  },
  sources: {
    "GET /api/sources": "público",
    "GET /api/sources/:id": "público",
    "POST /api/sources": "token",
    "PUT /api/sources/:id": "token (admin)",
    "DELETE /api/sources/:id": "token (admin)",
  },
  users: {
    "GET /api/users": "token (admin)",
    "GET /api/users/:id": "token (admin)",
    "POST /api/users": "token (admin)",
  },
  health: {
    "GET /api/health": "público",
  },
};

// Mensaje de bienvenida con el mapa de endpoints. Se exporta para que app.ts
// lo reutilice en GET / y no se rompa la URL raíz ya desplegada.
export function mostrarBienvenida(req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    mensaje: "API de EXO-ARCHIVE en funcionamiento",
    endpoints: ENDPOINTS,
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

router.use("/auth", authRoutes);
router.use("/exoplanets", exoplanetRoutes);
router.use("/users", userRoutes);
router.use("/sources", sourceRoutes);
router.use("/images", imageRoutes);
router.use("/observations", observationDirectRoutes);

// Los middlewares de 404 y 500 van al final del router porque Express los
// ejecuta en orden: el 404 solo debe saltar si ninguna ruta de la API
// coincidió, y el de errores recoge lo que los controladores pasan con
// next(err). Montarlos aquí hace que la API sea autónoma y responda siempre
// en JSON, con independencia de cómo se monte en app.ts.
router.use(notFound);
router.use(errorHandler);

export default router;
