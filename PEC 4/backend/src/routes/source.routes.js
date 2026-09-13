const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/source.controller");

router.get("/", ctrl.getSources);
router.get("/:id", ctrl.getSource);
router.post("/", ctrl.createSource);

module.exports = router;
