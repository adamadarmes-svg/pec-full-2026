import { Router } from "express";
import * as ctrl from "../controllers/exoplanet-controller";
import { proteger } from "../middlewares/auth-middleware";
import observationRoutes from "./observation-routes";

// Exoplanetas, montado en /api/exoplanets. La lectura es pública; crear,
// editar y borrar requieren token (el controlador comprueba además la autoría).
const router = Router();

router.get("/", ctrl.listarExoplanetas);
router.get("/:id", ctrl.obtenerExoplaneta);
router.post("/", proteger, ctrl.crearExoplaneta);
router.put("/:id", proteger, ctrl.actualizarExoplaneta);
router.delete("/:id", proteger, ctrl.eliminarExoplaneta);

// Observaciones de un exoplaneta: /api/exoplanets/:exoplanetaId/observations
router.use("/:exoplanetaId/observations", observationRoutes);

export default router;
