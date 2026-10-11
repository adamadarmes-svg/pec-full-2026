import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import routerRaiz, { mostrarBienvenida } from "./routes";
import { notFound } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handler";

const app = express();

// cors permite que el frontend, desplegado en otro dominio, llame a la API
app.use(cors());
app.use(express.json());

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
