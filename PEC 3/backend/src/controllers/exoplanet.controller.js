const Exoplanet = require("../models/Exoplanet");

async function getExoplanets(req, res, next) {
  try {
    const { tipoPlaneta, zonaHabitable, metodoDescubrimiento, buscar } = req.query;

    const filtro = {};
    if (tipoPlaneta) filtro.tipoPlaneta = tipoPlaneta;
    if (metodoDescubrimiento) filtro.metodoDescubrimiento = metodoDescubrimiento;
    if (zonaHabitable !== undefined) filtro.zonaHabitable = zonaHabitable === "true";
    if (buscar) filtro.nombre = { $regex: buscar, $options: "i" };

    const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);
    const limite = Math.min(parseInt(req.query.limite, 10) || 50, 100);

    const exoplanetas = await Exoplanet.find(filtro)
      .populate("fuentePrincipal", "titulo autores anio doi")
      .populate("creadoPor", "nombre institucion")
      .sort({ nombre: 1 })
      .skip((pagina - 1) * limite)
      .limit(limite);

    res.json(exoplanetas);
  } catch (err) {
    next(err);
  }
}

async function getExoplanet(req, res, next) {
  try {
    const exoplaneta = await Exoplanet.findById(req.params.id)
      .populate("fuentePrincipal", "titulo autores publicacion anio doi url")
      .populate("creadoPor", "nombre institucion");

    if (!exoplaneta) {
      return res.status(404).json({ mensaje: "Exoplaneta no encontrado" });
    }
    res.json(exoplaneta);
  } catch (err) {
    next(err);
  }
}

async function createExoplanet(req, res, next) {
  try {
    const nuevo = await Exoplanet.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

async function updateExoplanet(req, res, next) {
  try {
    const exoplaneta = await Exoplanet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exoplaneta) {
      return res.status(404).json({ mensaje: "Exoplaneta no encontrado" });
    }
    res.json(exoplaneta);
  } catch (err) {
    next(err);
  }
}

async function deleteExoplanet(req, res, next) {
  try {
    const exoplaneta = await Exoplanet.findByIdAndDelete(req.params.id);
    if (!exoplaneta) {
      return res.status(404).json({ mensaje: "Exoplaneta no encontrado" });
    }
    res.json({ mensaje: "Exoplaneta eliminado", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getExoplanets,
  getExoplanet,
  createExoplanet,
  updateExoplanet,
  deleteExoplanet,
};
