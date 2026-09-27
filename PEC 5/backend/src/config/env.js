import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = ['MONGODB_URI'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Faltan variables de entorno: ${missing.join(', ')}`);
  console.error('   Copia .env.example a .env y rellena los valores.');
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI,
  corsOrigins: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export const isProduction = env.nodeEnv === 'production';
