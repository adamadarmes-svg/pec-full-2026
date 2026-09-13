const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/exoplanet.controller");

router.get("/", ctrl.getExoplanets);
router.get("/:id", ctrl.getExoplanet);
router.post("/", ctrl.createExoplanet);
router.put("/:id", ctrl.updateExoplanet);
router.delete("/:id", ctrl.deleteExoplanet);

module.exports = router;
