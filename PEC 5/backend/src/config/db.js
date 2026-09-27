import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log(`✅ MongoDB conectado: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  }
}
