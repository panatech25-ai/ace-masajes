import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import serviceRoutes from './routes/services.js';
import scheduleRoutes from './routes/schedule.js';
import settingsRoutes from './routes/settings.js';
import { checkUpcomingReminders } from './services/scheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for API
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/settings', settingsRoutes);

// Vercel Cron Endpoint for 30-min WhatsApp reminders
app.all('/api/scheduler/check', async (req, res) => {
  try {
    await checkUpcomingReminders();
    res.json({ success: true, message: 'Scheduler check completed', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Error executing scheduler check:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'ACE Masajes API',
    tagline: 'Alma, Cuerpo, Espiritu',
    time: new Date().toISOString()
  });
});

// Serve frontend in production (if static files available)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>ACE Masajes - Alma, Cuerpo, Espiritu</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 50px;">
          <h1>🌿 ACE Masajes API Backend Activo</h1>
          <p>Servidor listo en Vercel / Node.js.</p>
        </body>
        </html>
      `);
    }
  });
});

export default app;
