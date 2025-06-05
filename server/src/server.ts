// src/server.ts
import app from './app';
// 👇 Importa el job para que se inicie al levantar el server
import './jobs/ordenesJob';
import './jobs/syncJob';     // importa el job de sincronización
import { syncInicialDesdeAWS } from './services/syncService';

const PORT = process.env.PORT || 3000;

const dbLocal = process.env.DATABASE_URL

console.log("🔗 Conectando a la base de datos local:", dbLocal);
async function startServer() {
  try {
    console.log("🚀 Iniciando sincronización inicial desde AWS a Local...");
    await syncInicialDesdeAWS();
    console.log("✅ Sincronización inicial completada.");
  } catch (error) {
    console.error("❌ Error durante sincronización inicial:", error);
    // Opcional: decidir si continuar con el arranque o no
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log(`Servidor corriendo en :3000`);
  });
}

startServer();
