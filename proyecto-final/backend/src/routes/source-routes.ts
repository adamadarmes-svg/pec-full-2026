import { Router } from "express";
import * as ctrl from "../controllers/source-controller";
import { proteger, soloAdmin } from "../middlewares/auth-middleware";

// editar y borrar fuentes es de admin porque afecta a todos los exoplanetas que las citan
const router = Router();

router.get("/", ctrl.listarFuentes);
router.get("/:id", ctrl.obtenerFuente);
router.post("/", proteger, ctrl.crearFuente);
router.put("/:id", proteger, soloAdmin, ctrl.actualizarFuente);
router.delete("/:id", proteger, soloAdmin, ctrl.eliminarFuente);

export default router;
