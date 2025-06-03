// src/routes/adminRoutes.ts
import express from "express";
import {
  registerAdmin,
  getUsers,
  updateUser,
  deleteUser,
  testConnection,
  getUserProfile,
  obtenerEstadisticas,
} from "../controllers/adminController";

const router = express.Router();

// Rutas públicas para gestión de usuarios
router.post("/registerA", (req: express.Request, res: express.Response) => {
  console.log("🚀 La ruta POST /api/registerA fue llamada");
  registerAdmin(req, res);
});
// ruta para obtener todos los user
router.get("/users", (req: express.Request, res: express.Response) => {
  console.log("ruta alcanzada getUser");
  getUsers(req, res);
});

router.get('/estadisticas', (req: express.Request, res: express.Response)=>{
  obtenerEstadisticas(req,res);
});

// Ruta para obtener el perfil de un usuario específico
router.get("/profile/:id", (req: express.Request, res: express.Response) => {
  getUserProfile(req, res); // Aquí se llama a la función getUserProfile que ya hemos ajustado
});
/// ruta par actualizar todo el user
router.put("/users/:id", (req: express.Request, res: express.Response) => {
  console.log("ruta alcanzada updateUser PUT");
  updateUser(req, res);
});
/// solo campos nesesarios a actualizar
router.patch("/profile/:id", (req: express.Request, res: express.Response) => {
  console.log("ruta alcanzada updateUser PACHT");
  updateUser(req, res);
});
/// boorar un user
router.delete("/users/:id", (req: express.Request, res: express.Response) => {
  console.log("ruta alcanzada deleteUser");
  deleteUser(req, res);
});

//// conexion a bd
router.get("/test", (req: express.Request, res: express.Response) => {
  console.log("ruta alcanzada test");

  testConnection(req, res);
});

export default router;
