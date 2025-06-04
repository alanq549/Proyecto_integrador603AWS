// src/server.ts
import app from './app';
// 👇 Importa el job para que se inicie al levantar el server
import './jobs/ordenesJob';
import './jobs/syncJob';     // importa el job de sincronización
import { syncInicialDesdeAWS } from '../src/services/syncService';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("🚀 Iniciando sincronización inicial desde AWS a Local...");
    await syncInicialDesdeAWS();
    console.log("✅ Sincronización inicial completada.");
  } catch (error) {
    console.error("❌ Error durante sincronización inicial:", error);
    // Opcional: decidir si continuar con el arranque o no
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
