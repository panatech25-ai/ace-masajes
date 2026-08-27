import app from './app.js';
import { startScheduler } from './services/scheduler.js';

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`✨ ACE Masajes Server iniciado en http://localhost:${PORT}`);
  console.log('🌿 Alma, Cuerpo, Espiritu');
  console.log('====================================================');

  // Start background reminder cron job in standalone node process
  startScheduler();
});
