import express from 'express';
import {
crearOrdenClienteOcasional, crearOrdenClienteRegistrado, crearOrdenDesdeCliente, getHistorialOrdenes, getServiceHistory, getTicketDetails,cancelarOrdenManual,
confirmarPagoOrden, obtenerOrdenesActivas
} from '../controllers/ordenesController';

const router = express.Router();


//orden para cliente ocasional
router.post('/ordenes/cliente-ocasional', (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /ordenes/cliente-ocasional alcanzada");
  crearOrdenClienteOcasional(req, res); // Crear orden para cliente ocasional
});

//orden para cliente registrado
router.post('/ordenes/cliente-registrado', (req: express.Request, res: express.Response) => {
  console.log("🧠 Ruta /ordenes/cliente-registrado alcanzada");
  crearOrdenClienteRegistrado(req, res); // Crear orden para cliente registrado
});



//confirmar pago de ordenes de la vista cliente
router.put('/orden/confirmar-pago/:idOrden', (req: express.Request, res: express.Response) => {
  confirmarPagoOrden(req, res);
});

/// ruta para cancelar una orden desde el lado del cliente
router.put('/orden/:id/cancelar',(req: express.Request, res: express.Response)=>{
  cancelarOrdenManual(req, res);
});

/// orden de lado del cliente 
router.post('/client/order', (req: express.Request, res: express.Response)=>{
  console.log('ruta para ordenar de lado del cliente');
  crearOrdenDesdeCliente(req, res);
});
//obtener ordenes activas
router.get('/ordenes/activas', (req: express.Request, res: express.Response) => {
  console.log("📜 Ruta /ordenes/activas alcanzada");
  obtenerOrdenesActivas(req, res);
});

// historial general de órdenes (completadas, canceladas, en proceso, etc.)
router.get('/ordenes/historial', (req: express.Request, res: express.Response) => {
  console.log("📜 Ruta /ordenes/historial alcanzada");
  getHistorialOrdenes(req, res); // Función que devuelve las órdenes con todos los estados
});

///historial para los clientes
router.get('/client/history/:id_usuario', (req: express.Request, res: express.Response)=>{
  console.log("ruta del hisorial de ordenes del cliente");
  getServiceHistory(req,res);
})

//ruta para el ticket
router.get('/client/ticket/:idOrden', (req: express.Request, res: express.Response)=>{
  console.log('ruta del ticket');
  getTicketDetails(req,res);
})

export default router;