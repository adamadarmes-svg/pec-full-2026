function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "CastError") {
    return res.status(400).json({ error: "Bad Request", mensaje: "ID no válido." });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation Error", mensaje: err.message });
  }

  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      error: "Conflict",
      mensaje: `Ya existe un registro con ese valor en el campo '${campo}'.`,
    });
  }

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    mensaje: err.message || "Ha ocurrido un error inesperado.",
  });
}

module.exports = errorHandler;
