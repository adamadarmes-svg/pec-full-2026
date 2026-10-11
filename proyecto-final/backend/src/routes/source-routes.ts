import { Router } from "express";
import * as ctrl from "../controllers/source-controller";
import { proteger, soloAdmin } from "../middlewares/auth-middleware";

// Fuentes científicas, montado en /api/sources. Son catálogo compartido y no
// tienen propietario: cualquier usuario identificado puede aportar una, pero
// editar o borrar afecta a todos los exoplanetas que la citan, así que es de admin.
const router = Router();

router.get("/", ctrl.listarFuentes);
router.get("/:id", ctrl.obtenerFuente);
router.post("/", proteger, ctrl.crearFuente);
router.put("/:id", proteger, soloAdmin, ctrl.actualizarFuente);
router.delete("/:id", proteger, soloAdmin, ctrl.eliminarFuente);

export default router;
