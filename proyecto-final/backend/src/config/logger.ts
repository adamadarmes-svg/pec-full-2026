import winston from "winston";
import type { StreamOptions } from "morgan";
import { ENV } from "./env";

const esProduccion = ENV.NODE_ENV === "production";

// Niveles de Winston, de más a menos grave:
//   error (0) < warn (1) < info (2) < http (3) < verbose (4) < debug (5) < silly (6)
// Un logger muestra su nivel y todos los más graves. Como http queda por
// debajo de info, con nivel "info" las peticiones de morgan se descartan.
// Por eso, si LOG_LEVEL no está definida, en desarrollo se usa "http" (se ven
// las peticiones) y en producción "info" (no se llenan los logs de Vercel con
// cada petición). Si LOG_LEVEL está definida, siempre manda ella.
const nivel = ENV.LOG_LEVEL ?? (esProduccion ? "info" : "http");

// Desarrollo: una línea legible con hora, nivel en color y el stack si lo hay
const formatoDesarrollo = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.printf(
    ({ timestamp, level, message, stack }) => `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ""}`
  )
);

// Producción: JSON, que el panel de logs de Vercel puede filtrar y buscar
const formatoProduccion = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.json()
);

// Solo transporte de consola, nunca ficheros: en Vercel el sistema de
// ficheros es efímero y de solo lectura fuera de /tmp, así que escribir un
// .log en disco fallaría. Vercel ya recoge todo lo que sale por consola.
export const logger = winston.createLogger({
  level: nivel,
  format: esProduccion ? formatoProduccion : formatoDesarrollo,
  transports: [new winston.transports.Console()],
});

// Puente para morgan: redirige cada línea de petición al logger en nivel
// http. Morgan añade un salto de línea al final que Winston ya pone por su cuenta.
export const morganStream: StreamOptions = {
  write: (mensaje: string) => {
    logger.http(mensaje.trimEnd());
  },
};

export default logger;
