import { Router } from "express";
import * as ctrl from "../controllers/exoplanet-controller";

// CRUD completo de exoplanetas, montado en /api/exoplanets
const router = Router();

router.get("/", ctrl.getExoplanets);
router.get("/:id", ctrl.getExoplanet);
router.post("/", ctrl.createExoplanet);
router.put("/:id", ctrl.updateExoplanet);
router.delete("/:id", ctrl.deleteExoplanet);

export default router;
