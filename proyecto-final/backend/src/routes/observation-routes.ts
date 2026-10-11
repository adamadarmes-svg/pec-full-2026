import { Router } from "express";
import * as ctrl from "../controllers/observation-controller";
import { opcional, proteger } from "../middlewares/auth-middleware";

// puse mergeParams porque sin él no llega el exoplanetaId de la ruta padre
const router = Router({ mergeParams: true });

router.get("/", opcional, ctrl.listarObservaciones);
router.post("/", proteger, ctrl.crearObservacion);

export default router;
