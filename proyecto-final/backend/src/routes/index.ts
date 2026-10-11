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

// agrupé todo bajo /api para que app.ts no tenga que conocer cada ruta
const router = Router();

// puse el nivel de acceso de cada endpoint para saber qué rutas piden token
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
    "GET /api/observations?visible=false": "token (admin)",
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

// la exporto para usarla también en la raíz y no romper la url desplegada
export function mostrarBienvenida(req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    mensaje: "api de exoarchive en funcionamiento",
    endpoints: ENDPOINTS,
  });
}

router.get("/", mostrarBienvenida);

// hice esta ruta para comprobar un despliegue sin necesidad de token
router.get("/health", (req: Request, res: Response) => {
  // índices de mongoose.connection.readyState
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

// puse 404 y 500 al final porque express los ejecuta en orden y así la api siempre responde en json
router.use(notFound);
router.use(errorHandler);

export default router;
