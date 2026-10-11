import { Router } from "express";
import * as ctrl from "../controllers/observation-controller";
import { opcional, proteger } from "../middlewares/auth-middleware";

// Observaciones de un exoplaneta, montado en /api/exoplanets/:exoplanetaId/observations.
// mergeParams es imprescindible: sin él, un router hijo no ve los parámetros
// de la ruta padre y req.params.exoplanetaId llegaría vacío.
const router = Router({ mergeParams: true });

router.get("/", opcional, ctrl.listarObservaciones);
router.post("/", proteger, ctrl.crearObservacion);

export default router;
