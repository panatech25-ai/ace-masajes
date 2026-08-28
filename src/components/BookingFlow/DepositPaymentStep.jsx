import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function DepositPaymentStep({
  selectedService,
  selectedDateFriendly,
  selectedTime,
  formData,
  onBack,
  onConfirm,
  loading
}) {
  const [copiedField, setCopiedField] = useState(null);

  const bankDetails = {
    bank: 'Reba (Reba Compañía Financiera S.A.)',
    holder: 'Jesica Natalia Panadisi',
    cuil: '27274624383',
    alias: 'masajes.ace.ars',
    cbu: '4150999718007868450029',
    accountNumber: '999-786845/2',
    depositAmount: 10000,
    totalAmount: selectedService?.price || 40000
  };

  const remainingAmount = bankDetails.totalAmount - bankDetails.depositAmount;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-spa-100 text-spa-800">
          <Sparkles className="w-3.5 h-3.5 text-spa-600" />
          Paso 4 de 4 • Confirmación
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
          Confirmación y Seña de Reserva
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Para asegurar tu turno en la agenda, solicitamos una seña de <strong className="text-spa-950 font-bold">$10.000</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Bank Details & Instructions */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
          
          {/* Friendly Note Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs sm:text-sm text-amber-950 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>¿Cómo funciona la seña de reserva?</span>
            </div>
            <p className="text-stone-700">
              Para garantizar tu lugar y preparar el espacio de manera personalizada, requerimos una seña de <strong>${bankDetails.depositAmount.toLocaleString('es-AR')}</strong>. El saldo restante (<strong>${remainingAmount.toLocaleString('es-AR')}</strong>) se abona el día de tu sesión.
            </p>
          </div>

          {/* Bank Account Details Card */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-spa-800 text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gold-300" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    Datos para la Transferencia
                  </h4>
                  <p className="text-[11px] text-stone-500">{bankDetails.bank}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-spa-900 bg-spa-100 px-2.5 py-1 rounded-full">
                Seña: ${bankDetails.depositAmount.toLocaleString('es-AR')}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Titular */}
              <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Titular de la cuenta:</span>
                <span className="font-bold text-stone-900">{bankDetails.holder}</span>
              </div>

              {/* CUIL */}
              <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">CUIL:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-900">{bankDetails.cuil}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.cuil, 'cuil')}
                    className="p-1 rounded-md text-stone-400 hover:text-spa-800 hover:bg-stone-200/60 transition-colors"
                    title="Copiar CUIL"
                  >
                    {copiedField === 'cuil' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Alias (Highlighted) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-spa-50/80 border border-spa-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-spa-800 block">
                    Alias
                  </span>
                  <span className="font-mono font-bold text-sm sm:text-base text-spa-950">
                    {bankDetails.alias}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.alias, 'alias')}
                  className="px-3 py-1.5 rounded-lg bg-spa-800 text-white text-xs font-bold hover:bg-spa-900 flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {copiedField === 'alias' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-gold-300" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Alias
                    </>
                  )}
                </button>
              </div>

              {/* CBU */}
              <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                <div>
                  <span className="text-stone-500 font-medium block">CBU:</span>
                  <span className="font-mono font-bold text-stone-800 text-xs break-all">
                    {bankDetails.cbu}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.cbu, 'cbu')}
                  className="p-1.5 rounded-md text-stone-500 hover:text-spa-800 hover:bg-stone-200/60 transition-colors shrink-0 ml-2"
                  title="Copiar CBU"
                >
                  {copiedField === 'cbu' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Nro de Cuenta */}
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Nº de cuenta ($):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-900">{bankDetails.accountNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.accountNumber, 'accountNumber')}
                    className="p-1 rounded-md text-stone-400 hover:text-spa-800 hover:bg-stone-200/60 transition-colors"
                    title="Copiar Nº de Cuenta"
                  >
                    {copiedField === 'accountNumber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Voucher Instructions */}
          <div className="p-4 rounded-2xl bg-spa-50/80 border border-spa-200/80 text-xs sm:text-sm text-spa-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-spa-900">
              <Sparkles className="w-4.5 h-4.5 text-spa-700 shrink-0" />
              <span>Envío del Comprobante</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Al confirmar tu reserva, por favor envía el comprobante de la transferencia al WhatsApp oficial de ACE Masajes: <strong className="text-spa-950 font-bold">+54 9 341 514-8958</strong>.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="px-5 py-3 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Modificar Datos
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-6 sm:px-8 py-3.5 rounded-2xl bg-spa-800 hover:bg-spa-900 active:scale-95 text-white shadow-lg shadow-spa-900/20 text-sm font-bold transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando Turno...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Confirmar Reserva de Turno
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Summary Side Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-spa-900 to-spa-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="border-b border-spa-800 pb-4">
            <span className="text-xs uppercase tracking-widest text-gold-300 font-semibold">
              Resumen Final
            </span>
            <h3 className="text-2xl font-serif-luxury font-bold text-white mt-1">
              ACE Masajes
            </h3>
            <p className="text-xs text-spa-200">
              Alma, Cuerpo, Espíritu
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">Tratamiento</span>
                <span className="font-bold text-white text-base">
                  {selectedService?.name}
                </span>
                <span className="text-xs text-spa-200 block">
                  {selectedService?.duration} minutos de sesión
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">Fecha</span>
                <span className="font-bold text-white text-sm capitalize">
                  {selectedDateFriendly}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">Horario</span>
                <span className="font-bold text-white text-sm">
                  {selectedTime} hs
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">A nombre de</span>
                <span className="font-bold text-white text-sm">
                  {formData.client_name}
                </span>
                <span className="text-xs text-spa-200 block">
                  {formData.client_phone}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-spa-800/80 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-spa-200">
              <span>Valor de la sesión:</span>
              <span className="font-semibold text-white">${bankDetails.totalAmount.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex items-center justify-between text-gold-300 font-bold bg-spa-800/60 p-2 rounded-xl">
              <span>Seña para confirmar hoy:</span>
              <span className="text-base">${bankDetails.depositAmount.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex items-center justify-between text-spa-300 text-[11px] pt-1">
              <span>Saldo a abonar en la sesión:</span>
              <span>${remainingAmount.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="bg-spa-800/40 rounded-2xl p-3.5 border border-spa-700/50 text-[11px] text-spa-200 leading-relaxed">
            🌿 <strong>Compromiso ACE:</strong> Al enviar tu comprobante, tu turno quedará 100% asegurado y recibirás el recordatorio 30 minutos antes de tu sesión.
          </div>
        </div>
      </div>
    </div>
  );
}
