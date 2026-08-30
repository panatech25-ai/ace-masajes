const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('ace_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Error ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Public
  getServices: (all = false) => request(`/services?all=${all}`),
  getAvailability: (date, serviceId) => request(`/appointments/availability?date=${date}&service_id=${serviceId || ''}`),
  createAppointment: (bookingData) => request('/appointments', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  getAppointment: (id) => request(`/appointments/${id}`),
  lookupAppointments: (phone) => request(`/appointments/lookup?phone=${encodeURIComponent(phone)}`),
  cancelAppointment: (id, reason) => request(`/appointments/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  getPublicSettings: () => request('/settings'),

  // Auth
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getMe: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) => request('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  }),

  // Admin Appointments
  getAdminAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    return request(`/appointments?${query.toString()}`);
  },
  getAdminStats: () => request('/appointments/stats/summary'),
  updateAppointment: (id, updates) => request(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteAppointment: (id, deleteSeries = false) => request(`/appointments/${id}?delete_series=${deleteSeries}`, {
    method: 'DELETE'
  }),
  sendWhatsApp: (id, type, customMessage) => request(`/appointments/${id}/send-whatsapp`, {
    method: 'POST',
    body: JSON.stringify({ type, customMessage })
  }),

  // Admin Services
  createService: (serviceData) => request('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  }),
  updateService: (id, serviceData) => request(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  }),
  deleteService: (id) => request(`/services/${id}`, {
    method: 'DELETE'
  }),

  // Admin Schedule
  getSchedule: () => request('/schedule'),
  updateScheduleConfig: (config) => request('/schedule/config', {
    method: 'PUT',
    body: JSON.stringify(config)
  }),
  addBlockedDate: (blocked) => request('/schedule/blocked', {
    method: 'POST',
    body: JSON.stringify(blocked)
  }),
  deleteBlockedDate: (id) => request(`/schedule/blocked/${id}`, {
    method: 'DELETE'
  }),

  // Admin Settings & WhatsApp
  getSettings: () => request('/settings'),
  updateSettings: (settingsData) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData)
  }),
  getNotificationLogs: (limit = 100) => request(`/settings/logs?limit=${limit}`),
  testWhatsApp: (phone, message) => request('/settings/test-whatsapp', {
    method: 'POST',
    body: JSON.stringify({ phone, message })
  }),
  runSchedulerNow: () => request('/settings/run-scheduler-now', {
    method: 'POST'
  }),

  // Admin Clients
  getClients: () => request('/settings/clients/all'),
  clearAllClients: () => request('/settings/clients/clear', { method: 'DELETE' }),
  deleteClient: (phone) => request(`/settings/clients/${encodeURIComponent(phone)}`, { method: 'DELETE' })
};
