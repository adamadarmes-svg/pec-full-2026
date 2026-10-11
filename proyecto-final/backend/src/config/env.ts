import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

// leo y valido las variables aquí una vez para que si falta una falle el arranque y no una petición cualquiera
dotenv.config();

// saqué el tipo de SignOptions para no depender de ms, que viene de rebote con jsonwebtoken
type DuracionJwt = Extract<NonNullable<SignOptions["expiresIn"]>, string>;

interface Entorno {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: DuracionJwt;
  NODE_ENV: string;
  CORS_ORIGINS: string[];
  // lo dejé sin valor por defecto porque el nivel lo decide logger.ts según el entorno
  LOG_LEVEL: string | undefined;
  // las dejé opcionales porque solo las usa crear-admin
  ADMIN_EMAIL: string | undefined;
  ADMIN_PASSWORD: string | undefined;
}

// hice un type guard porque jsonwebtoken no acepta un string cualquiera y exijo la unidad porque sin ella lee milisegundos
function esDuracionJwt(valor: string): valor is DuracionJwt {
  return /^\d+(\.\d+)? ?(ms|msecs?|milliseconds?|s|secs?|seconds?|m|mins?|minutes?|h|hrs?|hours?|d|days?|w|weeks?|y|yrs?|years?)$/i.test(
    valor
  );
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "falta MONGODB_URI. defínela en el .env o en vercel."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "falta JWT_SECRET. defínela en el .env o en vercel."
  );
}

// prefiero que un formato malo falle al arrancar y no en el primer login
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
if (!esDuracionJwt(JWT_EXPIRES_IN)) {
  throw new Error(
    `JWT_EXPIRES_IN no válido ("${JWT_EXPIRES_IN}"). usa un número con unidad: "7d", "12h" o "30m".`
  );
}

// pido el origen exacto y sin barra final porque el navegador lo manda así y si no coincide letra a letra cors lo rechaza
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);
if (CORS_ORIGINS.length === 0) {
  throw new Error(
    "falta CORS_ORIGINS. defínela en el .env o en vercel, separando los orígenes con comas."
  );
}
for (const origen of CORS_ORIGINS) {
  let valido = false;
  try {
    valido = new URL(origen).origin === origen;
  } catch {
    valido = false;
  }
  if (!valido) {
    throw new Error(
      `origen no válido en CORS_ORIGINS ("${origen}"). usa protocolo y dominio sin barra final: "https://ejemplo.vercel.app".`
    );
  }
}

export const ENV: Entorno = {
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGINS,
  LOG_LEVEL: process.env.LOG_LEVEL || undefined,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || undefined,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined,
};
