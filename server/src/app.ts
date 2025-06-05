import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // 🔹 Cargar variables de entorno primero

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import adminRoutes from './routes/adminRoutes';
import orderRoutes from './routes/ordenesRoutes';
import clientRoutes from './routes/clientRoutes';
import servicioRoutes from './routes/servicioRoutes';
import reportesRoutes from './routes/reportRoutes';
const crearAdminPorDefecto: CrearAdminPorDefecto = require('./utils/initAdmin').crearAdminPorDefecto;

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080'; // 🔹 URL del frontend, con valor por defecto
console.log('🚀 La URL del frontend es:', frontendURL);

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware de depuración
app.use((req, res, next) => {
  console.log(`🛰️ Solicitud recibida: ${req.method} ${req.url}`);
  next();
});

app.use('/api', (req, res, next) => {
  console.log('🌐 Rutas de API alcanzadas');
  next();
});

// Rutas
app.use('/api', adminRoutes);
app.use('/api', clientRoutes);
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', taskRoutes);
app.use('/api', servicioRoutes);
app.use('/api', reportesRoutes);

// 🔹 Llamar la función justo aquí
interface CrearAdminPorDefecto {
  (): Promise<void>;
}


crearAdminPorDefecto()
  .then((): void => console.log('✅ Verificación del admin por defecto completada'))
  .catch((err: unknown): void => console.error('❌ Error creando admin por defecto:', err));

export default app;
