import dns from "node:dns";
import { ENV } from "./config/env";
import app from "./app";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

// require.main === module solo es cierto al ejecutar el archivo directamente
// (desarrollo local). En Vercel el módulo se importa y no debe abrir puerto.
const esEjecucionDirecta = require.main === module;

// En local, algunos DNS de router no resuelven los registros SRV de
// mongodb+srv; se fuerzan DNS públicos solo fuera de Vercel.
if (esEjecucionDirecta) {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
}

// Conexión temprana para que la primera petición no espere. Si falla, solo se
// registra: el middleware de app.ts reintenta en cada petición.
connectDB(ENV.MONGODB_URI).catch((err: Error) =>
  logger.error(`Error de conexión a MongoDB: ${err.message}`)
);

if (esEjecucionDirecta) {
  app.listen(ENV.PORT, () => logger.info(`API escuchando en http://localhost:${ENV.PORT}`));
}

// Vercel usa la app exportada como manejador de la función serverless
export default app;
