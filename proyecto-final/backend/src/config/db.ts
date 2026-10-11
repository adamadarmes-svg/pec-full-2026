import mongoose, { Connection } from "mongoose";

// Conecta a MongoDB reutilizando la conexión si ya existe. En Vercel cada
// petición puede ejecutarse en una instancia ya "caliente", y abrir una
// conexión nueva cada vez agotaría el pool de Atlas.
export async function connectDB(uri: string): Promise<Connection> {
  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }
  // readyState >= 1 significa conectado o conectando
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Conectado a MongoDB Atlas");
  return mongoose.connection;
}

export default connectDB;
