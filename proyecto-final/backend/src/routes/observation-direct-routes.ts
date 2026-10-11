import { Router } from "express";
import * as ctrl from "../controllers/observation-controller";
import { proteger, soloAdmin } from "../middlewares/auth-middleware";

// editar y borrar van por el id de la observación porque ya guarda su exoplaneta
const router = Router();

router.get("/", proteger, soloAdmin, ctrl.listarObservacionesModeracion);
router.put("/:id", proteger, ctrl.actualizarObservacion);
router.patch("/:id/ocultar", proteger, soloAdmin, ctrl.ocultarObservacion);
router.delete("/:id", proteger, ctrl.eliminarObservacion);

export default router;
