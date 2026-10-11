import dns from "node:dns";
import { ENV } from "./config/env";
import app from "./app";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

// solo abro puerto en local porque en vercel el archivo se importa como función
const esEjecucionDirecta = require.main === module;

// fuerzo dns públicos solo en local porque algunos routers no resuelven mongodb+srv
if (esEjecucionDirecta) {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}

// conecto pronto para que la primera petición no espere, si falla lo reintenta el middleware
connectDB(ENV.MONGODB_URI).catch((err: Error) =>
  logger.error(`error de conexión a mongodb: ${err.message}`)
);

if (esEjecucionDirecta) {
  app.listen(ENV.PORT, () => logger.info(`api escuchando en http://localhost:${ENV.PORT}`));
}

// exporto la app porque vercel la usa como función
export default app;
