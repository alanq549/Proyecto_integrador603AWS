// src/routes/authRoutes.ts
import express from "express";
import {
  registerUser,
  registerAdmin,
  loginUser,
  requestChange, verifyAndChange,
  verifyEmail
} from "../controllers/authController";

const router = express.Router();

router.post("/verify-email", (req, res, next) => {
  verifyEmail(req, res).catch(next);
});

// Ruta para registrar un usuario con rol 'cliente'
router.post("/register", (req: express.Request, res: express.Response) => {
  registerUser(req, res); // Mantienes consistencia
});

// Ruta para login
router.post("/login", (req: express.Request, res: express.Response) => {
  loginUser(req, res); // Igual que register
});

///en base a las rutas de la api, se puede crear un nuevo usuario con rol administrador
router.post("/registerA", (req: express.Request, res: express.Response) => {
  registerAdmin(req, res); // Igual que register
});




// Wrap async handlers to catch errors and pass them to Express
router.post("/request-change", (req, res, next) => {
    console.log('ruta para el cambio 1');

  requestChange(req, res).catch(next);
});

router.post("/verify-change", (req, res, next) => {
  console.log('ruta para el cambio 2');
  verifyAndChange(req, res).catch(next);
});



export default router;
