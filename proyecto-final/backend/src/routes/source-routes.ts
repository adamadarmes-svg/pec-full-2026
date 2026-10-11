import { Router } from "express";
import * as ctrl from "../controllers/source-controller";

// Fuentes científicas, montado en /api/sources
const router = Router();

router.get("/", ctrl.getSources);
router.get("/:id", ctrl.getSource);
router.post("/", ctrl.createSource);

export default router;
