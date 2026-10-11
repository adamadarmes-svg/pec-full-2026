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

// helmet va primero para que sus cabeceras HTTP de seguridad (nosniff,
// HSTS, ocultar X-Powered-By...) se apliquen a todas las respuestas
app.use(helmet());

// cors permite que el frontend, desplegado en otro dominio, llame a la API
app.use(cors());

// Registro de peticiones a través de Winston. "dev" es corto y legible en
// local; "combined" es el formato estándar de Apache, con IP y user-agent.
app.use(morgan(ENV.NODE_ENV === "production" ? "combined" : "dev", { stream: morganStream }));

// Límite de 10 MB (el de serie es 100 KB) porque las imágenes subidas viajan
// en Base64 dentro del JSON. En Vercel manda además el límite de la
// plataforma (4,5 MB por petición), que se controla en el image-controller.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Asegura la conexión a MongoDB antes de cada petición. En Vercel la función
// puede arrancar en frío y atender la petición antes de que termine la
// conexión iniciada en server.ts; sin esperar aquí, Mongoose acumula las
// consultas y falla con "buffering timed out".
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB(ENV.MONGODB_URI);
    next();
  } catch (err) {
    next(err);
  }
});

// Se mantiene la bienvenida en la raíz para no romper la URL ya desplegada
app.get("/", mostrarBienvenida);

app.use("/api", routerRaiz);

// 404 y 500 están montados en dos sitios a propósito: los del router raíz
// cubren la API (/api/...), y estos de app cubren todo lo demás, es decir,
// las rutas que caen fuera de /api y los errores del middleware de conexión
// a la base de datos, que se ejecuta antes de entrar en el router.
app.use(notFound);
app.use(errorHandler);

export default app;
