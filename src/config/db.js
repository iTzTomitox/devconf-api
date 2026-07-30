import mongoose from 'mongoose';
import { config } from './config.js';

export const connectDB = async () => {
  if (!config.mongoUrl) {
    console.error('[db] Falta la variable de entorno MONGO_URL');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUrl);
    console.log('[db] Conectado a MongoDB');
  } catch (error) {
    console.error(`[db] Error de conexion: ${error.message}`);
    process.exit(1);
  }
};