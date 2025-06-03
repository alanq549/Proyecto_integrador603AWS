import cron from 'node-cron';
import { syncBidireccional } from '../services/syncService';
/// cada minuto 
cron.schedule('*/1 * * * *', async () => {
  console.log('⏳ Ejecutando sincronización bidireccional Local <-> AWS');
  try {
    await syncBidireccional();
    console.log('✅ Sincronización completada');
  } catch (error) {
    console.error('💥 Error durante la sincronización:', error);
  }
});
