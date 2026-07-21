require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB(process.env.MONGODB_URI).catch((err) =>
  console.error("Error de conexión a MongoDB:", err.message)
);

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
}

module.exports = app;
