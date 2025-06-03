//src/routes/clientRoutes.ts
import express from "express";
import {
  addVehicle,
  buscarClienteRegistrado,
  getVehiclesByUserId,
  getAllVehicles,
} from "../controllers/clientController";
console.log("🚀 clientRoutes.ts cargado");

const router = express.Router();

// Dar de alta un vehículo para el cliente
router.post(
  "/client/:id_usuario/vehicle",
  (req: express.Request, res: express.Response) => {
    console.log("🧠 Ruta /client/:id_usuario/vehicle alcanzada");
    addVehicle(req, res); // Dar de alta un vehículo
  }
);
///ruta para buscar los vehiculos de los clientes :
router.get("/vehicles/user/:id_usuario", (req: express.Request, res: express.Response) => {
  console.log("get de los vehiculos alcanzado", getVehiclesByUserId);
  getVehiclesByUserId(req, res);
});

///  ruta para ver todos los vehiculos 
router.get("/todosV", (req: express.Request, res: express.Response)=>{
  console.log('todos los vehiculos', getAllVehicles);
  getAllVehicles(req, res);
})


router.get("/buscar", (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /buscar alcanzada");
  buscarClienteRegistrado(req, res); // Buscar cliente registrado
});

export default router;
