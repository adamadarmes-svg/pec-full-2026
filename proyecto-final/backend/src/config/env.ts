import dotenv from "dotenv";

// Centralizar aquí las variables evita repetir process.env por todo el código,
// y así se validan una sola vez al arrancar en lugar de fallar más tarde.
dotenv.config();

interface Entorno {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string | undefined;
  JWT_EXPIRES_IN: string;
  NODE_ENV: string;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Sin base de datos la API no puede funcionar: mejor fallar al arrancar
if (!MONGODB_URI) {
  throw new Error(
    "Falta la variable de entorno MONGODB_URI. Defínela en el archivo .env o en el panel de Vercel."
  );
}

// JWT aún no se usa, así que de momento solo se avisa
if (!process.env.JWT_SECRET) {
  console.warn("Aviso: JWT_SECRET no está definida. La autenticación no funcionará hasta configurarla.");
}

export const ENV: Entorno = {
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
};
