import mongoose, { Connection } from "mongoose";
import { logger } from "./logger";

// reutilizo la conexión porque en vercel abrir una por petición agotaba el pool de atlas
export async function connectDB(uri: string): Promise<Connection> {
  if (!uri) {
    throw new Error("falta MONGODB_URI en el .env.");
  }
  // cuento también "conectando" para que dos peticiones a la vez no abran dos conexiones
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    // lo bajé de 30 s a 5 s porque vercel corta antes con un 504 genérico y se perdía el mensaje de la api
    serverSelectionTimeoutMS: 5000,
    // lo bajé de 100 a 5 porque cada instancia abre su propio pool y el plan m0 de atlas admite 500 conexiones en total
    maxPoolSize: 5,
  });
  logger.info("conectado a mongodb atlas");
  return mongoose.connection;
}

export default connectDB;
