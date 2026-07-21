const Source = require("../models/Source");

async function getSources(req, res, next) {
  try {
    const fuentes = await Source.find().sort({ anio: -1 });
    res.json(fuentes);
  } catch (err) {
    next(err);
  }
}

async function getSource(req, res, next) {
  try {
    const fuente = await Source.findById(req.params.id);
    if (!fuente) {
      return res.status(404).json({ mensaje: "Fuente no encontrada" });
    }
    res.json(fuente);
  } catch (err) {
    next(err);
  }
}

async function createSource(req, res, next) {
  try {
    const nueva = await Source.create(req.body);
    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSources, getSource, createSource };
