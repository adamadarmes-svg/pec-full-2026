import { Router } from "express";
import * as ctrl from "../controllers/user-controller";
import { proteger, soloAdmin } from "../middlewares/auth-middleware";

// Usuarios, montado en /api/users. Las tres rutas requieren administrador:
// - GET / y GET /:id expondrían públicamente los emails de los usuarios.
// - POST / crea el usuario con el body tal cual, incluido el rol, así que
//   abierto permitiría a cualquiera crearse una cuenta admin. El alta normal
//   de usuarios va por /api/auth/registro, que siempre asigna "investigador".
const router = Router();

router.get("/", proteger, soloAdmin, ctrl.getUsers);
router.get("/:id", proteger, soloAdmin, ctrl.getUser);
router.post("/", proteger, soloAdmin, ctrl.createUser);

export default router;
