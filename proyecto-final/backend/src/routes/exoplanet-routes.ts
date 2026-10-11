import { Router } from "express";
import * as ctrl from "../controllers/exoplanet-controller";
import { proteger } from "../middlewares/auth-middleware";
import observationRoutes from "./observation-routes";

// proteger solo exige sesión, la autoría la compruebo en el controlador
const router = Router();

router.get("/", ctrl.listarExoplanetas);
router.get("/:id", ctrl.obtenerExoplaneta);
router.post("/", proteger, ctrl.crearExoplaneta);
router.put("/:id", proteger, ctrl.actualizarExoplaneta);
router.delete("/:id", proteger, ctrl.eliminarExoplaneta);

router.use("/:exoplanetaId/observations", observationRoutes);

export default router;
