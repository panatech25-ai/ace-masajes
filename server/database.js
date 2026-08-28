import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In serverless environments (Vercel/AWS Lambda), /tmp is the only writable directory
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const DATA_DIR = IS_SERVERLESS ? '/tmp' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'masajes_db.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only serverless fallback
}

// Supabase client initialization (if credentials provided)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

if (supabase) {
  console.log('🌿 Conectado a Supabase PostgreSQL Cloud');
} else {
  console.log('💾 Utilizando almacenamiento local /tmp JSON');
}

// Default initial state
const defaultInitialData = {
  users: [
    {
      id: 'usr_admin',
      username: 'jpanadisi',
      password_hash: bcrypt.hashSync('Taxi1781!', 10),
      name: 'J. Panadisi',
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ],
  services: [
    {
      id: 'srv_relajantes',
      name: 'Relajantes',
      description: 'Movimientos suaves y armonizadores con aceites esenciales para calmar el sistema nervioso, reducir el estrés y relajar todo el cuerpo.',
      duration: 60,
      price: 40000,
      active: true,
      category: 'Relajación',
      icon: 'Sparkles',
      order: 1
    },
    {
      id: 'srv_drenaje',
      name: 'Drenaje linfático',
      description: 'Terapia manual suave y rítmica que estimula el sistema linfático para eliminar toxinas, reducir retención de líquidos e inflamación.',
      duration: 60,
      price: 40000,
      active: true,
      category: 'Terapéutico',
      icon: 'Droplets',
      order: 2
    },
    {
      id: 'srv_reflexologia',
      name: 'Reflexología',
      description: 'Presión en puntos reflejos clave de los pies y manos que corresponden y equilibran los diferentes órganos y sistemas del cuerpo.',
      duration: 60,
      price: 40000,
      active: true,
      category: 'Holístico',
      icon: 'HeartPulse',
      order: 3
    },
    {
      id: 'srv_reductores',
      name: 'Reductores',
      description: 'Masaje dinámico con maniobras intensas y modeladoras enfocado en disolver adiposidades localizadas, activar la circulación y tonificar.',
      duration: 60,
      price: 40000,
      active: true,
      category: 'Modelador',
      icon: 'Flame',
      order: 4
    },
    {
      id: 'srv_ventosas',
      name: 'Con ventosas',
      description: 'Terapia milenaria con ventosas de succión que incrementa la microcirculación, alivia dolores miofasciales y oxigena los tejidos profundos.',
      duration: 60,
      price: 40000,
      active: true,
      category: 'Descontracturante',
      icon: 'Activity',
      order: 5
    },
    {
      id: 'srv_maderoterapia',
      name: 'Maderoterapia',
      description: 'Tratamiento natural que utiliza instrumentos de madera noble diseñados para adaptarse a la anatomía, reafirmar contornos y desbloquear energía.',
      duration: 60,
      price: 40000,
      active: true,
      category: 'Holístico',
      icon: 'Smile',
      order: 6
    }
  ],
  schedule_config: {
    slot_interval: 30, // minutes
    buffer_between_slots: 15, // minutes
    min_advance_hours: 1,
    max_advance_days: 45,
    days: [
      { day_of_week: 0, day_name: 'Domingo', is_working: false, open_time: '10:00', close_time: '18:00', has_break: false, break_start: '13:00', break_end: '14:00' },
      { day_of_week: 1, day_name: 'Lunes', is_working: true, open_time: '09:00', close_time: '20:00', has_break: true, break_start: '13:00', break_end: '14:00' },
      { day_of_week: 2, day_name: 'Martes', is_working: true, open_time: '09:00', close_time: '20:00', has_break: true, break_start: '13:00', break_end: '14:00' },
      { day_of_week: 3, day_name: 'Miércoles', is_working: true, open_time: '09:00', close_time: '20:00', has_break: true, break_start: '13:00', break_end: '14:00' },
      { day_of_week: 4, day_name: 'Jueves', is_working: true, open_time: '09:00', close_time: '20:00', has_break: true, break_start: '13:00', break_end: '14:00' },
      { day_of_week: 5, day_name: 'Viernes', is_working: true, open_time: '09:00', close_time: '20:00', has_break: true, break_start: '13:00', break_end: '14:00' },
      { day_of_week: 6, day_name: 'Sábado', is_working: true, open_time: '09:30', close_time: '19:00', has_break: true, break_start: '13:30', break_end: '14:30' }
    ]
  },
  blocked_dates: [],
  appointments: [],
  settings: {
    business_name: 'ACE Masajes',
    tagline: 'Alma, Cuerpo, Espiritu',
    business_phone: '+54 9 341 514-8958',
    business_address: '',
    deposit_amount: 10000,
    bank_name: 'Reba (Reba Compañía Financiera S.A.)',
    bank_holder: 'Jesica Natalia Panadisi',
    bank_cuil: '27274624383',
    bank_alias: 'masajes.ace.ars',
    bank_cbu: '4150999718007868450029',
    bank_account_number: '999-786845/2',
    whatsapp_enabled: true,
    whatsapp_provider: 'direct', // 'direct' | 'meta' | 'twilio' | 'webhook'
    whatsapp_meta_token: '',
    whatsapp_meta_phone_number_id: '',
    whatsapp_twilio_account_sid: '',
    whatsapp_twilio_auth_token: '',
    whatsapp_twilio_from_number: '',
    whatsapp_webhook_url: '',
    template_confirmation: '¡Hola *{cliente}*! 🌿 Tu turno en *ACE Masajes (Alma, Cuerpo, Espíritu)* ha sido confirmado con éxito.\n\n💆 *Servicio:* {servicio}\n📅 *Fecha:* {fecha}\n⏰ *Hora:* {hora} hs\n📝 *Tus datos:* {direccion} | 📞 {telefono}\n\n_Por favor presentarse 5 minutos antes. ¡Te esperamos para renovar tu energía!_',
    template_reminder: '🔔 *Recordatorio de Turno - ACE Masajes*\n\n¡Hola *{cliente}*! Te recordamos que en *30 minutos* ({hora} hs) comienza tu sesión de *{servicio}*.\n\n¡Nos vemos pronto para cuidar tu Alma, Cuerpo y Espíritu! ✨',
    template_cancellation: 'Hola *{cliente}*, te informamos que tu turno para *{servicio}* del día *{fecha}* a las *{hora} hs* ha sido cancelado. Si deseas reprogramar, ingresa a nuestra web o comunícate con nosotros.'
  },
  notification_logs: []
};

// In-memory cache synced with disk and Supabase
let dbData = null;

function loadDatabase() {
  if (dbData) return dbData;
  dbData = JSON.parse(JSON.stringify(defaultInitialData));
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      dbData = {
        ...defaultInitialData,
        ...parsed,
        users: parsed.users || defaultInitialData.users,
        services: (parsed.services && parsed.services.length > 0) ? parsed.services : defaultInitialData.services,
        schedule_config: parsed.schedule_config || defaultInitialData.schedule_config,
        blocked_dates: parsed.blocked_dates || [],
        appointments: parsed.appointments || [],
        settings: parsed.settings || defaultInitialData.settings,
        notification_logs: parsed.notification_logs || []
      };
    } else {
      saveDatabase();
    }
  } catch (err) {
    dbData = JSON.parse(JSON.stringify(defaultInitialData));
  }
  return dbData;
}

function saveDatabase() {
  if (!dbData) return;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    // In serverless read-only mode, keep in memory
  }
}

// Database helper functions
export const db = {
  get: () => loadDatabase(),
  save: () => saveDatabase(),

  // Users
  getUserByUsername: async (username) => {
    const data = loadDatabase();
    if (supabase) {
      try {
        const { data: dbUser, error } = await supabase.from('users').select('*').ilike('username', username).single();
        if (!error && dbUser) return dbUser;
      } catch (e) {}
    }
    return data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  },
  getUserById: async (id) => {
    const data = loadDatabase();
    if (supabase) {
      try {
        const { data: dbUser, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error && dbUser) return dbUser;
      } catch (e) {}
    }
    return data.users.find((u) => u.id === id);
  },
  updateUserPassword: async (id, newHash) => {
    const data = loadDatabase();
    const user = data.users.find((u) => u.id === id);
    if (user) {
      user.password_hash = newHash;
      saveDatabase();
    }
    if (supabase) {
      try {
        await supabase.from('users').update({ password_hash: newHash }).eq('id', id);
      } catch (e) {}
    }
    return true;
  },

  // Services
  getServices: async (activeOnly = false) => {
    const data = loadDatabase();
    if (supabase) {
      try {
        let q = supabase.from('services').select('*').order('order', { ascending: true });
        if (activeOnly) q = q.eq('active', true);
        const { data: dbServices, error } = await q;
        if (!error && Array.isArray(dbServices) && dbServices.length > 0) {
          data.services = dbServices;
          saveDatabase();
          return dbServices;
        }
      } catch (e) {}
    }
    if (activeOnly) {
      return data.services.filter((s) => s.active);
    }
    return data.services;
  },
  getServiceById: (id) => {
    const data = loadDatabase();
    return (
      data.services.find((s) => s.id === id) ||
      data.services.find((s) => s.name?.toLowerCase() === id?.toLowerCase()) ||
      defaultInitialData.services.find((s) => s.id === id) ||
      defaultInitialData.services[0]
    );
  },
  createService: async (service) => {
    const data = loadDatabase();
    const newService = {
      id: `srv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: service.name,
      description: service.description || '',
      duration: parseInt(service.duration, 10) || 60,
      price: parseFloat(service.price) || 0,
      active: service.active !== false,
      category: service.category || 'General',
      icon: service.icon || 'Sparkles',
      order: data.services.length + 1
    };
    data.services.push(newService);
    saveDatabase();
    if (supabase) {
      try {
        await supabase.from('services').insert(newService);
      } catch (e) {}
    }
    return newService;
  },
  updateService: async (id, updates) => {
    const data = loadDatabase();
    const index = data.services.findIndex((s) => s.id === id);
    if (index !== -1) {
      data.services[index] = {
        ...data.services[index],
        ...updates,
        duration: updates.duration !== undefined ? parseInt(updates.duration, 10) : data.services[index].duration,
        price: updates.price !== undefined ? parseFloat(updates.price) : data.services[index].price
      };
      saveDatabase();
      if (supabase) {
        try {
          await supabase.from('services').update(updates).eq('id', id);
        } catch (e) {}
      }
      return data.services[index];
    }
    return null;
  },
  deleteService: async (id) => {
    const data = loadDatabase();
    const initialLen = data.services.length;
    data.services = data.services.filter((s) => s.id !== id);
    if (data.services.length !== initialLen) {
      saveDatabase();
      if (supabase) {
        try {
          await supabase.from('services').delete().eq('id', id);
        } catch (e) {}
      }
      return true;
    }
    return false;
  },

  // Appointments
  getAppointments: (filter = {}) => {
    const data = loadDatabase();
    let list = [...(data.appointments || [])];

    if (filter.date) {
      list = list.filter((a) => a.date === filter.date);
    }
    if (filter.startDate && filter.endDate) {
      list = list.filter((a) => a.date >= filter.startDate && a.date <= filter.endDate);
    }
    if (filter.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.client_name?.toLowerCase().includes(q) ||
          a.client_phone?.toLowerCase().includes(q) ||
          (a.client_address && a.client_address.toLowerCase().includes(q)) ||
          a.service_name?.toLowerCase().includes(q)
      );
    }

    // Sort by date and time
    return list.sort((a, b) => {
      if (a.date === b.date) {
        return (a.time || '').localeCompare(b.time || '');
      }
      return (a.date || '').localeCompare(b.date || '');
    });
  },

  getAppointmentsAsync: async (filter = {}) => {
    let list = [];
    if (supabase) {
      try {
        let query = supabase.from('appointments').select('*');
        if (filter.date) query = query.eq('date', filter.date);
        if (filter.startDate && filter.endDate) {
          query = query.gte('date', filter.startDate).lte('date', filter.endDate);
        }
        if (filter.status) query = query.eq('status', filter.status);
        const { data: dbRows, error } = await query;
        if (!error && Array.isArray(dbRows)) {
          list = dbRows;
          const data = loadDatabase();
          data.appointments = dbRows;
          saveDatabase();
        }
      } catch (err) {
        console.error('Supabase getAppointments error:', err);
      }
    }
    if (list.length === 0) {
      list = db.getAppointments(filter);
    }
    return list.sort((a, b) => {
      if (a.date === b.date) {
        return (a.time || '').localeCompare(b.time || '');
      }
      return (a.date || '').localeCompare(b.date || '');
    });
  },

  getAppointmentById: (id) => {
    const data = loadDatabase();
    return (data.appointments || []).find((a) => a.id === id);
  },

  createAppointment: async (appointment) => {
    const data = loadDatabase();
    if (!data.appointments) data.appointments = [];

    const newAppointment = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      series_id: appointment.series_id || null,
      recurrence_type: appointment.recurrence_type || null,
      recurrence_index: appointment.recurrence_index || null,
      recurrence_total: appointment.recurrence_total || null,
      recurrence_rule: appointment.recurrence_rule || null,
      service_id: appointment.service_id,
      service_name: appointment.service_name,
      service_duration: parseInt(appointment.service_duration, 10) || 60,
      service_price: parseFloat(appointment.service_price) || 0,
      client_name: appointment.client_name,
      client_address: appointment.client_address || '',
      client_phone: appointment.client_phone,
      client_notes: appointment.client_notes || '',
      date: appointment.date,
      time: appointment.time,
      end_time: appointment.end_time,
      status: appointment.status || 'confirmed',
      reminder_sent: 0,
      confirmation_sent: 0,
      source: appointment.source || 'web',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.appointments.push(newAppointment);
    saveDatabase();

    if (supabase) {
      try {
        const { error } = await supabase.from('appointments').insert(newAppointment);
        if (error) console.error('Supabase error inserting appointment:', error);
      } catch (err) {
        console.error('Supabase insert appointment exception:', err);
      }
    }
    return newAppointment;
  },

  updateAppointment: async (id, updates) => {
    const data = loadDatabase();
    if (!data.appointments) data.appointments = [];
    const index = data.appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      data.appointments[index] = {
        ...data.appointments[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      saveDatabase();
      if (supabase) {
        try {
          await supabase.from('appointments').update(updates).eq('id', id);
        } catch (e) {}
      }
      return data.appointments[index];
    }
    return null;
  },

  deleteAppointment: async (id) => {
    const data = loadDatabase();
    if (!data.appointments) return false;
    const initialLen = data.appointments.length;
    data.appointments = data.appointments.filter((a) => a.id !== id);
    if (data.appointments.length !== initialLen) {
      saveDatabase();
      if (supabase) {
        try {
          await supabase.from('appointments').delete().eq('id', id);
        } catch (e) {}
      }
      return true;
    }
    return false;
  },

  deleteAppointmentSeries: async (seriesId) => {
    const data = loadDatabase();
    if (!data.appointments) return false;
    const initialLen = data.appointments.length;
    data.appointments = data.appointments.filter((a) => a.series_id !== seriesId);
    if (data.appointments.length !== initialLen) {
      saveDatabase();
      if (supabase) {
        try {
          await supabase.from('appointments').delete().eq('series_id', seriesId);
        } catch (e) {}
      }
      return true;
    }
    return false;
  },

  // Schedule Config
  getScheduleConfig: () => {
    const data = loadDatabase();
    return data.schedule_config || defaultInitialData.schedule_config;
  },
  updateScheduleConfig: async (newConfig) => {
    const data = loadDatabase();
    data.schedule_config = {
      ...(data.schedule_config || defaultInitialData.schedule_config),
      ...newConfig
    };
    saveDatabase();
    if (supabase) {
      try {
        await supabase.from('schedule_config').upsert({ id: 1, ...data.schedule_config });
      } catch (e) {}
    }
    return data.schedule_config;
  },

  // Blocked Dates
  getBlockedDates: () => {
    const data = loadDatabase();
    return data.blocked_dates || [];
  },
  addBlockedDate: async (blocked) => {
    const data = loadDatabase();
    const newBlocked = {
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: blocked.date,
      all_day: blocked.all_day !== false,
      start_time: blocked.start_time || null,
      end_time: blocked.end_time || null,
      reason: blocked.reason || 'No disponible',
      created_at: new Date().toISOString()
    };
    if (!data.blocked_dates) data.blocked_dates = [];
    data.blocked_dates.push(newBlocked);
    saveDatabase();
    if (supabase) {
      try {
        await supabase.from('blocked_dates').insert(newBlocked);
      } catch (e) {}
    }
    return newBlocked;
  },
  deleteBlockedDate: async (id) => {
    const data = loadDatabase();
    if (!data.blocked_dates) return false;
    const initialLen = data.blocked_dates.length;
    data.blocked_dates = data.blocked_dates.filter((b) => b.id !== id);
    if (data.blocked_dates.length !== initialLen) {
      saveDatabase();
      if (supabase) {
        try {
          await supabase.from('blocked_dates').delete().eq('id', id);
        } catch (e) {}
      }
      return true;
    }
    return false;
  },

  // Settings
  getSettings: () => {
    const data = loadDatabase();
    return data.settings || defaultInitialData.settings;
  },
  updateSettings: async (newSettings) => {
    const data = loadDatabase();
    data.settings = {
      ...(data.settings || defaultInitialData.settings),
      ...newSettings
    };
    saveDatabase();
    if (supabase) {
      try {
        await supabase.from('settings').upsert({ id: 1, ...data.settings });
      } catch (e) {}
    }
    return data.settings;
  },

  // Notification Logs
  addNotificationLog: async (log) => {
    const data = loadDatabase();
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      appointment_id: log.appointment_id || null,
      type: log.type,
      recipient_phone: log.recipient_phone,
      recipient_name: log.recipient_name,
      message: log.message,
      status: log.status,
      provider: log.provider,
      error: log.error || null,
      created_at: new Date().toISOString()
    };
    if (!data.notification_logs) data.notification_logs = [];
    data.notification_logs.unshift(newLog);
    if (data.notification_logs.length > 500) {
      data.notification_logs = data.notification_logs.slice(0, 500);
    }
    saveDatabase();
    if (supabase) {
      try {
        await supabase.from('notification_logs').insert(newLog);
      } catch (e) {}
    }
    return newLog;
  },
  getNotificationLogs: (limit = 100) => {
    const data = loadDatabase();
    return (data.notification_logs || []).slice(0, limit);
  }
};
