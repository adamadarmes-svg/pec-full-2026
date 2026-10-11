import { Router } from "express";
import * as ctrl from "../controllers/observation-controller";
import { proteger, soloAdmin } from "../middlewares/auth-middleware";

// Observaciones por su propio id, montado en /api/observations. Editar y
// borrar no necesitan el exoplaneta en la URL: ya lo guarda la observación.
const router = Router();

router.put("/:id", proteger, ctrl.actualizarObservacion);
router.patch("/:id/ocultar", proteger, soloAdmin, ctrl.ocultarObservacion);
router.delete("/:id", proteger, ctrl.eliminarObservacion);

export default router;
