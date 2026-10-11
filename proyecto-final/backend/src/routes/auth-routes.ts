import { Router } from "express";
import * as ctrl from "../controllers/auth-controller";
import { proteger } from "../middlewares/auth-middleware";

// Autenticación, montado en /api/auth. Registro y login son públicos; el
// perfil necesita token.
const router = Router();

router.post("/registro", ctrl.registrarUsuario);
router.post("/login", ctrl.iniciarSesion);
router.get("/perfil", proteger, ctrl.obtenerPerfil);

export default router;
