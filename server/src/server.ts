// src/server.ts
import fs from 'fs';
import https from 'https';
import app from './app';
import './jobs/ordenesJob';
import './jobs/syncJob';
import { syncInicialDesdeAWS } from './services/syncService';

const PORT = process.env.PORT || 3000;

// Ruta a los certificados (ajusta si los moviste)
const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

const dbLocal = process.env.DATABASE_URL;
console.log("🔗 Conectando a la base de datos local:", dbLocal);

async function startServer() {
  try {
    console.log("🚀 Iniciando sincronización inicial desde AWS a Local...");
    await syncInicialDesdeAWS();
    console.log("✅ Sincronización inicial completada.");
  } catch (error) {
    console.error("❌ Error durante sincronización inicial:", error);
    // Decide si quieres seguir arrancando o detener aquí
  }

  // 🚀 Iniciar el servidor con HTTPS
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`✅ Servidor HTTPS corriendo en https://carwashdp603.ddns.net:${PORT}`);
  });
}

startServer();
