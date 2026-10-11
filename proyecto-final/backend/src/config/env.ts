import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

// Centralizar aquí las variables evita repetir process.env por todo el código,
// y así se validan una sola vez al arrancar en lugar de fallar más tarde.
dotenv.config();

// Duración en el formato que acepta jsonwebtoken ("7d", "12h", "30 m"...).
// Se deriva de SignOptions para no depender directamente de la librería ms.
type DuracionJwt = Extract<NonNullable<SignOptions["expiresIn"]>, string>;

interface Entorno {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: DuracionJwt;
  NODE_ENV: string;
  // Sin valor por defecto aquí: logger.ts decide el nivel según el entorno
  LOG_LEVEL: string | undefined;
  // Solo las usa el script crear-admin, por eso pueden faltar
  ADMIN_EMAIL: string | undefined;
  ADMIN_PASSWORD: string | undefined;
}

// Type guard: process.env solo da string, y jsonwebtoken exige un literal
// con formato de duración. Validar el formato es lo que permite a TypeScript
// estrechar el tipo sin castings. Se exige la unidad porque jsonwebtoken
// interpreta un número sin unidad como milisegundos ("3600" = 3,6 segundos).
function esDuracionJwt(valor: string): valor is DuracionJwt {
  return /^\d+(\.\d+)? ?(ms|msecs?|milliseconds?|s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|weeks?|y|yrs?|years?)$/i.test(
    valor
  );
}

const MONGODB_URI = process.env.MONGODB_URI;

// Sin base de datos la API no puede funcionar: mejor fallar al arrancar
if (!MONGODB_URI) {
  throw new Error(
    "Falta la variable de entorno MONGODB_URI. Defínela en el archivo .env o en el panel de Vercel."
  );
}

// Sin secreto no se pueden firmar ni verificar tokens: la autenticación entera depende de él
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "Falta la variable de entorno JWT_SECRET. Defínela en el archivo .env o en el panel de Vercel."
  );
}

// Un formato erróneo se detecta al arrancar, no en el primer login
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
if (!esDuracionJwt(JWT_EXPIRES_IN)) {
  throw new Error(
    `JWT_EXPIRES_IN tiene un formato no válido ("${JWT_EXPIRES_IN}"). Usa un número con unidad, por ejemplo "7d", "12h" o "30m".`
  );
}

export const ENV: Entorno = {
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || undefined,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || undefined,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined,
};
