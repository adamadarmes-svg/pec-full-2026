import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ENV } from "./config/env";
import { morganStream } from "./config/logger";
import { connectDB } from "./config/db";
import routerRaiz, { mostrarBienvenida } from "./routes";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";

const app = express();

// puse helmet primero para que sus cabeceras de seguridad salgan en todas las respuestas, también en los errores
app.use(helmet());

// dejo pasar las peticiones sin origin porque son las de curl, el healthcheck y las img de /archivo, que no pasan por cors
app.use(
  cors({
    origin: (origen, callback) => {
      if (!origen || ENV.CORS_ORIGINS.includes(origen)) {
        callback(null, true);
        return;
      }
      // lo mando como error con nombre propio para que el manejador responda 403 con el origen y no un fallo mudo
      const error = new Error(`origen no permitido: ${origen}. añádelo a CORS_ORIGINS.`);
      error.name = "CorsError";
      callback(error);
    },
  })
);

// mandé morgan a winston para que en producción las peticiones salgan en json con el resto de logs
app.use(morgan(ENV.NODE_ENV === "production" ? "combined" : "dev", { stream: morganStream }));

// subí el límite a 10 mb porque las imágenes llegan en base64 dentro del json
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// espero a la conexión en cada petición porque en vercel la función arranca en frío y sin esto mongoose fallaba con buffering timed out
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB(ENV.MONGODB_URI);
    next();
  } catch (err) {
    next(err);
  }
});

// dejé la bienvenida también en la raíz para no romper la url que ya estaba desplegada
app.get("/", mostrarBienvenida);

app.use("/api", routerRaiz);

// monté 404 y 500 otra vez aquí porque las rutas fuera de /api y los fallos de conexión no llegan al router
app.use(notFound);
app.use(errorHandler);

export default app;
