const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const exoplanetRoutes = require("./routes/exoplanet.routes");
const userRoutes = require("./routes/user.routes");
const sourceRoutes = require("./routes/source.routes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API de EXO-ARCHIVE en funcionamiento",
    endpoints: {
      exoplanets: "/api/exoplanets",
      users: "/api/users",
      sources: "/api/sources",
      health: "/api/health",
    },
  });
});

app.get("/api/health", (req, res) => {
  const estados = ["desconectado", "conectado", "conectando", "desconectando"];
  res.json({
    ok: true,
    servidor: "activo",
    baseDeDatos: estados[mongoose.connection.readyState] || "desconocido",
    fecha: new Date().toISOString(),
  });
});

app.use("/api/exoplanets", exoplanetRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sources", sourceRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
