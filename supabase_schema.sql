-- ==============================================================================
-- ACE MASAJES (Alma, Cuerpo, Espíritu) - Supabase PostgreSQL Schema
-- Copia y pega este script en el SQL Editor de tu proyecto en Supabase (supabase.com)
-- ==============================================================================

-- 1. Tabla de Usuarios (Administrador)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Servicios de Masajes
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL DEFAULT 40000,
  active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Bienestar',
  icon TEXT DEFAULT 'Sparkles',
  "order" INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Configuración de Horarios
CREATE TABLE IF NOT EXISTS schedule_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  slot_interval INTEGER DEFAULT 30,
  buffer_between_slots INTEGER DEFAULT 15,
  min_advance_hours INTEGER DEFAULT 1,
  max_advance_days INTEGER DEFAULT 45,
  days JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Fechas Bloqueadas / Feriados
CREATE TABLE IF NOT EXISTS blocked_dates (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  all_day BOOLEAN DEFAULT true,
  start_time TEXT,
  end_time TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Turnos (Appointments)
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  series_id TEXT,
  recurrence_type TEXT,
  recurrence_index INTEGER,
  recurrence_total INTEGER,
  recurrence_rule TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_duration INTEGER NOT NULL,
  service_price NUMERIC NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_notes TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'pending', 'completed', 'cancelled'
  reminder_sent INTEGER DEFAULT 0,
  reminder_sent_at TIMESTAMPTZ,
  reminder_status TEXT,
  confirmation_sent INTEGER DEFAULT 0,
  source TEXT DEFAULT 'web',
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida de turnos
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_series ON appointments(series_id);

-- 6. Tabla de Configuración General & WhatsApp
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  business_name TEXT DEFAULT 'ACE Masajes',
  tagline TEXT DEFAULT 'Alma, Cuerpo, Espiritu',
  business_phone TEXT DEFAULT '+54 9 341 514-8958',
  business_address TEXT DEFAULT '',
  deposit_amount NUMERIC DEFAULT 10000,
  bank_name TEXT DEFAULT 'Reba (Reba Compañía Financiera S.A.)',
  bank_holder TEXT DEFAULT 'Jesica Natalia Panadisi',
  bank_cuil TEXT DEFAULT '27274624383',
  bank_alias TEXT DEFAULT 'masajes.ace.ars',
  bank_cbu TEXT DEFAULT '4150999718007868450029',
  bank_account_number TEXT DEFAULT '999-786845/2',
  whatsapp_enabled BOOLEAN DEFAULT true,
  whatsapp_provider TEXT DEFAULT 'direct',
  whatsapp_meta_token TEXT DEFAULT '',
  whatsapp_meta_phone_number_id TEXT DEFAULT '',
  whatsapp_twilio_account_sid TEXT DEFAULT '',
  whatsapp_twilio_auth_token TEXT DEFAULT '',
  whatsapp_twilio_from_number TEXT DEFAULT '',
  whatsapp_webhook_url TEXT DEFAULT '',
  template_confirmation TEXT DEFAULT '¡Hola *{cliente}*! 🌿 Tu turno en *ACE Masajes (Alma, Cuerpo, Espíritu)* ha sido confirmado con éxito.\n\n💆 *Servicio:* {servicio}\n📅 *Fecha:* {fecha}\n⏰ *Hora:* {hora} hs\n📝 *Tus datos:* {direccion} | 📞 {telefono}\n\n_Por favor presentarse 5 minutos antes. ¡Te esperamos para renovar tu energía!_',
  template_reminder TEXT DEFAULT '🔔 *Recordatorio de Turno - ACE Masajes*\n\n¡Hola *{cliente}*! Te recordamos que en *30 minutos* ({hora} hs) comienza tu sesión de *{servicio}*.\n\n¡Nos vemos pronto para cuidar tu Alma, Cuerpo y Espíritu! ✨',
  template_cancellation TEXT DEFAULT 'Hola *{cliente}*, te informamos que tu turno para *{servicio}* del día *{fecha}* a las *{hora} hs* ha sido cancelado. Si deseas reprogramar, ingresa a nuestra web o comunícate con nosotros.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Logs de Notificaciones
CREATE TABLE IF NOT EXISTS notification_logs (
  id TEXT PRIMARY KEY,
  appointment_id TEXT,
  type TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DATOS INICIALES PREDETERMINADOS (Seed Data)
-- ==============================================================================

-- Usuario Administrador (Usuario: jpanadisi | Clave: Taxi1781!)
INSERT INTO users (id, username, password_hash, name, role)
VALUES (
  'usr_admin',
  'jpanadisi',
  '$2b$10$LWvj6frCHwF7GYSnJKWAfeVUamnZMgNnGHcvG0xMOu/tzJkP8j0ya',
  'J. Panadisi',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Catálogo Oficial de los 6 Masajes a $40.000
INSERT INTO services (id, name, description, duration, price, active, category, icon, "order")
VALUES
  ('srv_relajantes', 'Relajantes', 'Movimientos suaves y armonizadores con aceites esenciales para calmar el sistema nervioso, reducir el estrés y relajar todo el cuerpo.', 60, 40000, true, 'Relajación', 'Sparkles', 1),
  ('srv_drenaje', 'Drenaje linfático', 'Técnica suave y rítmica que estimula el sistema linfático, favorece la eliminación de toxinas y reduce la retención de líquidos.', 60, 40000, true, 'Terapéutico', 'Droplets', 2),
  ('srv_reflexologia', 'Reflexología', 'Presión en puntos reflejos específicos de los pies y manos que conectan con órganos y sistemas para restablecer el equilibrio natural.', 60, 40000, true, 'Holístico', 'Smile', 3),
  ('srv_reductores', 'Reductores', 'Maniobras enérgicas y modeladoras enfocadas en movilizar el tejido adiposo y tonificar zonas localizadas.', 60, 40000, true, 'Estético', 'Flame', 4),
  ('srv_ventosas', 'Con ventosas', 'Terapia milenaria con ventosas de succión que mejora la microcirculación, alivia contracturas profundas y oxigena los tejidos.', 60, 40000, true, 'Descontracturante', 'Activity', 5),
  ('srv_maderoterapia', 'Maderoterapia', 'Técnica holística con elementos anatómicos de madera natural para drenar, modelar la figura y aliviar tensiones musculares.', 60, 40000, true, 'Holístico', 'HeartPulse', 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price;

-- Horarios Semanales (Lunes a Sábado 09:00 a 20:00)
INSERT INTO schedule_config (id, slot_interval, buffer_between_slots, min_advance_hours, max_advance_days, days)
VALUES (
  1,
  30,
  15,
  1,
  45,
  '[
    {"day_of_week": 0, "day_name": "Domingo", "is_working": false, "open_time": "10:00", "close_time": "18:00", "has_break": false, "break_start": "13:00", "break_end": "14:00"},
    {"day_of_week": 1, "day_name": "Lunes", "is_working": true, "open_time": "09:00", "close_time": "20:00", "has_break": true, "break_start": "13:00", "break_end": "14:00"},
    {"day_of_week": 2, "day_name": "Martes", "is_working": true, "open_time": "09:00", "close_time": "20:00", "has_break": true, "break_start": "13:00", "break_end": "14:00"},
    {"day_of_week": 3, "day_name": "Miércoles", "is_working": true, "open_time": "09:00", "close_time": "20:00", "has_break": true, "break_start": "13:00", "break_end": "14:00"},
    {"day_of_week": 4, "day_name": "Jueves", "is_working": true, "open_time": "09:00", "close_time": "20:00", "has_break": true, "break_start": "13:00", "break_end": "14:00"},
    {"day_of_week": 5, "day_name": "Viernes", "is_working": true, "open_time": "09:00", "close_time": "20:00", "has_break": true, "break_start": "13:00", "break_end": "14:00"},
    {"day_of_week": 6, "day_name": "Sábado", "is_working": true, "open_time": "09:30", "close_time": "19:00", "has_break": true, "break_start": "13:30", "break_end": "14:30"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Configuración y Datos de Seña Bancaria
INSERT INTO settings (id, business_name, tagline, business_phone, business_address, deposit_amount, bank_name, bank_holder, bank_cuil, bank_alias, bank_cbu, bank_account_number)
VALUES (
  1,
  'ACE Masajes',
  'Alma, Cuerpo, Espiritu',
  '+54 9 341 514-8958',
  '',
  10000,
  'Reba (Reba Compañía Financiera S.A.)',
  'Jesica Natalia Panadisi',
  '27274624383',
  'masajes.ace.ars',
  '4150999718007868450029',
  '999-786845/2'
)
ON CONFLICT (id) DO NOTHING;
