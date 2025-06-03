// src/routes/servicioRoutes.ts
import express from 'express';
import { createService,updateService, getAllServicios, getServiciosActivos, deleteService, getServicios } from "../controllers/servicioController";

const router = express.Router();

//// Ruta para crear un nuevo servicio
router.post("/newService", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /servicio alcanzada");
  createService(req, res); // Crear nuevo servicio
});

// Ruta para actualizar un servicio
router.put("/updateService/:id", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /servicio alcanzada");
  updateService(req, res); // Actualizar servicio
});

//// Ruta para obtener todos los servicios 
router.get("/Allservice", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /Allservice alcanzada")
  getAllServicios(req, res); // Obtener todos los servicios activos
});

//// Ruta para obtener todos los servicios activos
router.get("/service", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /service alcanzada")
  getServiciosActivos(req, res); // Obtener todos los servicios activos
});

//// Ruta para obtener todos los servicios con el filtro de activo e inactivo
router.get("/services", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /servicios alcanzada")
  getServicios(req, res); // Obtener todos los servicios activos
});

//// Ruta para eliminar un servicio
router.delete("/deleteService/:id", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /deleteService alcanzada")
  deleteService(req, res); // Eliminar servicio
});

export default router;
