const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller");

router.get("/", ctrl.getUsers);
router.get("/:id", ctrl.getUser);
router.post("/", ctrl.createUser);

module.exports = router;
