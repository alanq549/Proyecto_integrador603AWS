import cron from 'node-cron';
import { cancelarOrdenesImpagas } from '../controllers/ordenesController'; // ajustá el path si lo movés

// Ejecutar cada 1 minutos
cron.schedule('*/1 * * * *', async () => {
  console.log("⏳ Ejecutando tarea programada: cancelación de órdenes impagas");
  try {
    await cancelarOrdenesImpagas();
  } catch (error) {
    console.error("💥 Error durante la cancelación automática de órdenes:", error);
  }
});
