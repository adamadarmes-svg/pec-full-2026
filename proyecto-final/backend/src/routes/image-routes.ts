import { Router } from "express";
import * as ctrl from "../controllers/image-controller";
import { opcional, proteger, soloAdmin } from "../middlewares/auth-middleware";

// Imágenes, montado en /api/images. La lectura usa opcional porque lo que se
// ve depende de quién mira (anónimo, autor o admin); publicar es solo de admin.
const router = Router();

router.get("/", opcional, ctrl.listarImagenes);
router.get("/:id", opcional, ctrl.obtenerImagen);
router.get("/:id/archivo", opcional, ctrl.obtenerArchivoImagen);
router.post("/", proteger, ctrl.crearImagen);
router.put("/:id", proteger, ctrl.actualizarImagen);
router.patch("/:id/publicar", proteger, soloAdmin, ctrl.publicarImagen);
router.delete("/:id", proteger, ctrl.eliminarImagen);

export default router;
