import { Router } from "express";
import * as ctrl from "../controllers/user-controller";

// Usuarios, montado en /api/users
const router = Router();

router.get("/", ctrl.getUsers);
router.get("/:id", ctrl.getUser);
router.post("/", ctrl.createUser);

export default router;
