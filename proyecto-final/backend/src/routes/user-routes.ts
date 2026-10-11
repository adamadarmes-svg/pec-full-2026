import { Router } from "express";
import * as ctrl from "../controllers/user-controller";
import { proteger, soloAdmin } from "../middlewares/auth-middleware";

// todo es de admin porque estas rutas enseñan emails y dejan crear usuarios con cualquier rol
const router = Router();

router.get("/", proteger, soloAdmin, ctrl.listarUsuarios);
router.get("/:id", proteger, soloAdmin, ctrl.obtenerUsuario);
router.post("/", proteger, soloAdmin, ctrl.crearUsuario);

export default router;
