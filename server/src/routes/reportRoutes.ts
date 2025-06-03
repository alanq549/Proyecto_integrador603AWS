import express from 'express';
import { resumen, clientesTipo, ingresos, serviciosDistribucion, getUltimasOrdenes  } from '../controllers/reportescontroller';

const router = express.Router();

router.get('/reportes/resumen', (req, res) => {
  console.log("Ruta GET /reportes/resumen");
  resumen(req, res);
});

router.get('/reportes/clientes-tipo', (req, res) => {
  console.log("Ruta GET /reportes/clientes-tipo");
  clientesTipo(req, res);
});

router.get('/reportes/ingresos', (req, res) => {
  console.log("Ruta GET /reportes/ingresos");
  ingresos(req, res);
});

router.get('/reportes/servicios-distribucion', (req, res) => {
  console.log("Ruta GET /reportes/servicios-distribucion");
  serviciosDistribucion(req, res);
});

router.get('/reportes/ultimas-ordenes', (req: express.Request, res: express.Response)=>{
    console.log('ultimas ordenes alcanzadas');
    getUltimasOrdenes(req, res);
})

export default router;
