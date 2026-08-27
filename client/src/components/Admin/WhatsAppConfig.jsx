import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  MessageCircle,
  Clock,
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  RefreshCw,
  Eye,
  FileText,
  Activity
} from 'lucide-react';

export default function WhatsAppConfig() {
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState('confirmation'); // 'confirmation', 'reminder', 'cancellation'
  
  // Test WhatsApp state
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [schedulerTriggerResult, setSchedulerTriggerResult] = useState(null);
  const [triggeringScheduler, setTriggeringScheduler] = useState(false);

  const loadData = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
      const l = await api.getNotificationLogs(50);
      setLogs(l);
    } catch (err) {
      console.error('Error loading settings/logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      alert('Configuración de WhatsApp guardada exitosamente.');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInsertTag = (tag) => {
    const fieldMap = {
      confirmation: 'template_confirmation',
      reminder: 'template_reminder',
      cancellation: 'template_cancellation'
    };
    const field = fieldMap[activeTemplateTab];
    const current = settings[field] || '';
    setSettings({ ...settings, [field]: current + tag });
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testWhatsApp(testPhone);
      setTestResult(res);
      loadData();
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleForceScheduler = async () => {
    setTriggeringScheduler(true);
    setSchedulerTriggerResult(null);
    try {
      const res = await api.runSchedulerNow();
      setSchedulerTriggerResult(res.message);
      loadData();
    } catch (err) {
      setSchedulerTriggerResult('Error: ' + err.message);
    } finally {
      setTriggeringScheduler(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-stone-500">Cargando configuración de WhatsApp...</div>;
  }

  // Live preview mockup
  const getPreviewText = () => {
    const template =
      activeTemplateTab === 'confirmation'
        ? settings.template_confirmation
        : activeTemplateTab === 'reminder'
        ? settings.template_reminder
        : settings.template_cancellation;

    return (template || '')
      .replace(/{cliente}/g, 'Laura González')
      .replace(/{servicio}/g, 'Masaje Descontracturante')
      .replace(/{fecha}/g, 'Miércoles 27 de Agosto de 2026')
      .replace(/{hora}/g, '16:30')
      .replace(/{duracion}/g, '60 min')
      .replace(/{precio}/g, '$22.000')
      .replace(/{direccion}/g, 'Av. Santa Fe 2340')
      .replace(/{telefono}/g, '11 5555 1234')
      .replace(/{direccion_negocio}/g, settings.business_address || 'Espacio ACE Masajes')
      .replace(/{telefono_negocio}/g, settings.business_phone || '+54 9 11 5555-0199');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <MessageCircle className="w-7 h-7 fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
              Automatización de WhatsApp y Recordatorios
            </h3>
            <p className="text-xs text-stone-500">
              Personaliza mensajes automáticos, recordatorios 30 minutos antes y proveedores
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleForceScheduler}
          disabled={triggeringScheduler}
          className="px-4 py-2 rounded-xl bg-spa-100 hover:bg-spa-200 text-spa-900 text-xs font-bold transition-all flex items-center gap-1.5"
          title="Revisa turnos en los próximos 30 minutos ahora mismo"
        >
          <Activity className="w-3.5 h-3.5 text-spa-700" />
          {triggeringScheduler ? 'Verificando...' : 'Ejecutar Recordatorio 30m Ahora'}
        </button>
      </div>

      {schedulerTriggerResult && (
        <div className="p-3.5 rounded-2xl bg-spa-50 text-spa-900 border border-spa-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-spa-700 shrink-0" />
          {schedulerTriggerResult}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Template Editor with Live WhatsApp Chat Preview */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Plantillas de Mensajes de WhatsApp
            </h4>

            {/* Template tab switcher */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTemplateTab('confirmation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTemplateTab === 'confirmation'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Confirmación de Turno
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplateTab('reminder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTemplateTab === 'reminder'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Recordatorio 30m Antes
              </button>
              <button
                type="button"
                onClick={() => setActiveTemplateTab('cancellation')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTemplateTab === 'cancellation'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. Cancelación
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Editor column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block w-full mb-1">
                  Insertar variable:
                </span>
                {['{cliente}', '{servicio}', '{fecha}', '{hora}', '{duracion}', '{precio}', '{direccion}', '{telefono}', '{direccion_negocio}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-mono font-semibold transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {activeTemplateTab === 'confirmation' && (
                <textarea
                  rows="7"
                  value={settings.template_confirmation || ''}
                  onChange={(e) => setSettings({ ...settings, template_confirmation: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-stone-200 font-sans text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              )}

              {activeTemplateTab === 'reminder' && (
                <textarea
                  rows="7"
                  value={settings.template_reminder || ''}
                  onChange={(e) => setSettings({ ...settings, template_reminder: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-stone-200 font-sans text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              )}

              {activeTemplateTab === 'cancellation' && (
                <textarea
                  rows="7"
                  value={settings.template_cancellation || ''}
                  onChange={(e) => setSettings({ ...settings, template_cancellation: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-stone-200 font-sans text-xs sm:text-sm font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              )}
            </div>

            {/* Live WhatsApp Preview */}
            <div className="lg:col-span-5 bg-[#ECE5DD] rounded-3xl p-4 border border-stone-300 shadow-inner flex flex-col justify-between min-h-[260px]">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-300/80 mb-3 text-xs font-semibold text-stone-700">
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                Vista Previa WhatsApp
              </div>

              {/* Chat bubble */}
              <div className="bg-white rounded-2xl p-3.5 shadow-sm text-xs text-stone-800 space-y-1 relative self-start max-w-[90%] whitespace-pre-wrap leading-relaxed font-sans">
                {getPreviewText()}
                <span className="text-[9px] text-stone-400 block text-right mt-1">
                  16:00 ✓✓
                </span>
              </div>

              <div className="text-[10px] text-stone-500 text-center pt-2">
                Simulación del mensaje que recibirá el cliente en su celular.
              </div>
            </div>
          </div>
        </div>

        {/* Provider Settings */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-spa-700" />
            Proveedor de Envío de WhatsApp
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'direct',
                title: 'Enlaces Directos (wa.me)',
                desc: 'Apertura en 1 clic de WhatsApp Web/App. Costo cero, 100% confiable y sin configuración adicional.'
              },
              {
                id: 'meta',
                title: 'Meta Cloud API Oficial',
                desc: 'API oficial de WhatsApp Business Graph. Envío en segundo plano.'
              },
              {
                id: 'twilio',
                title: 'Twilio WhatsApp API',
                desc: 'Servicio de mensajería empresarial Twilio.'
              },
              {
                id: 'webhook',
                title: 'Webhook Personalizado',
                desc: 'Evolution API, UltraMsg, Baileys o bot propio.'
              }
            ].map((prov) => (
              <div
                key={prov.id}
                onClick={() => setSettings({ ...settings, whatsapp_provider: prov.id })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  settings.whatsapp_provider === prov.id
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <span className="font-bold text-xs text-stone-900 block mb-1">
                  {prov.title}
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {prov.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Conditional Credentials fields */}
          {settings.whatsapp_provider === 'meta' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Meta API Access Token</label>
                <input
                  type="password"
                  value={settings.whatsapp_meta_token || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_meta_token: e.target.value })}
                  placeholder="EAAB..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={settings.whatsapp_meta_phone_number_id || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_meta_phone_number_id: e.target.value })}
                  placeholder="10987654321..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
            </div>
          )}

          {settings.whatsapp_provider === 'twilio' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Account SID</label>
                <input
                  type="text"
                  value={settings.whatsapp_twilio_account_sid || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_twilio_account_sid: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Auth Token</label>
                <input
                  type="password"
                  value={settings.whatsapp_twilio_auth_token || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_twilio_auth_token: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">From Number</label>
                <input
                  type="text"
                  value={settings.whatsapp_twilio_from_number || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_twilio_from_number: e.target.value })}
                  placeholder="+14155238886"
                  className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                />
              </div>
            </div>
          )}

          {settings.whatsapp_provider === 'webhook' && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <label className="block font-bold text-stone-700 mb-1">Webhook Endpoint URL</label>
              <input
                type="url"
                value={settings.whatsapp_webhook_url || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp_webhook_url: e.target.value })}
                placeholder="https://api.tudominio.com/send-whatsapp"
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-spa-800 hover:bg-spa-900 text-white font-bold text-xs shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </form>

      {/* Test WhatsApp Tool */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-600" />
          Probar Envío de WhatsApp
        </h4>

        <form onSubmit={handleSendTest} className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex-1 min-w-[240px]">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Número de teléfono para prueba (ej. 11 5555 1234)"
              required
              className="w-full p-2.5 rounded-xl border border-stone-200 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={testing || !testPhone.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            {testing ? 'Enviando...' : 'Enviar Prueba'}
          </button>
        </form>

        {testResult && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <span className="font-bold text-stone-900 block">Resultado de la prueba:</span>
            {testResult.directLink && (
              <a
                href={testResult.directLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                Abrir mensaje en WhatsApp Web / App
              </a>
            )}
          </div>
        )}
      </div>

      {/* Notification Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-stone-900 font-serif-luxury">
              Registro de Notificaciones Enviadas
            </h4>
            <p className="text-xs text-stone-500">
              Historial de confirmaciones y recordatorios a clientes
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl"
            title="Actualizar registro"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Fecha y Hora</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Destinatario</th>
                <th className="py-2.5 px-4">Mensaje</th>
                <th className="py-2.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-stone-400">
                    No hay notificaciones en el registro.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 whitespace-nowrap text-stone-500 font-mono">
                      {log.created_at?.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-bold text-stone-800">
                      {log.type === 'confirmation'
                        ? '🌿 Confirmación'
                        : log.type === 'reminder_30m'
                        ? '🔔 Recordatorio 30m'
                        : log.type}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {log.recipient_name} ({log.recipient_phone})
                    </td>
                    <td className="py-2.5 px-4 max-w-xs truncate text-stone-600">
                      {log.message}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
