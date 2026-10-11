import winston from "winston";
import type { StreamOptions } from "morgan";
import { ENV } from "./env";

const esProduccion = ENV.NODE_ENV === "production";

// en desarrollo uso http para ver las peticiones de morgan y en producción info para no llenar los logs de vercel
const nivel = ENV.LOG_LEVEL ?? (esProduccion ? "info" : "http");

const formatoDesarrollo = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.printf(
    ({ timestamp, level, message, stack }) => `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ""}`
  )
);

// uso json en producción porque vercel lo puede filtrar por campos
const formatoProduccion = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.json()
);

// solo consola y nunca ficheros porque en vercel el disco es de solo lectura
export const logger = winston.createLogger({
  level: nivel,
  format: esProduccion ? formatoProduccion : formatoDesarrollo,
  transports: [new winston.transports.Console()],
});

// quito el salto final porque winston ya pone uno y salía una línea en blanco por petición
export const morganStream: StreamOptions = {
  write: (mensaje: string) => {
    logger.http(mensaje.trimEnd());
  },
};

export default logger;
