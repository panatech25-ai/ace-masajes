import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import ServiceSelector from './ServiceSelector';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker from './TimeSlotPicker';
import ClientDetailsForm from './ClientDetailsForm';
import DepositPaymentStep from './DepositPaymentStep';
import BookingSuccessModal from './BookingSuccessModal';
import { Sparkles, Calendar as CalendarIcon, User, Check, ArrowLeft, ArrowRight, AlertCircle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BookingWizard() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  // Date & Time state
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Client Details Form state
  const [formData, setFormData] = useState({
    client_name: '',
    client_address: '',
    client_phone: '',
    client_notes: ''
  });

  // Submission & Success state
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load active services on mount
  useEffect(() => {
    async function loadServices() {
      try {
        const list = await api.getServices();
        setServices(list);
        if (list.length > 0 && !selectedService) {
          setSelectedService(list[0]);
        }
      } catch (err) {
        console.error('Error loading services:', err);
      }
    }
    loadServices();
  }, []);

  // Fetch availability whenever selectedDate or selectedService changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate) return;
      setLoadingAvailability(true);
      try {
        const data = await api.getAvailability(selectedDate, selectedService?.id);
        setAvailability(data);
        // Reset selected time if not available in current list
        if (selectedTime) {
          const exists = data.slots?.some((s) => s.time === selectedTime);
          if (!exists) setSelectedTime(null);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    }

    fetchAvailability();
  }, [selectedDate, selectedService]);

  // Auto scroll to top on step changes for comfortable mobile navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Friendly date display
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const friendlyDate = selectedDateObj
    ? format(selectedDateObj, "EEEE d 'de' MMMM", { locale: es })
    : '';

  const handleCreateBooking = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        service_id: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        client_name: formData.client_name,
        client_address: formData.client_address,
        client_phone: formData.client_phone,
        client_notes: formData.client_notes,
        source: 'web'
      };

      const result = await api.createAppointment(payload);

      // Construct voucher message for WhatsApp
      const voucherMsg = `¡Hola Jesica! 🌿 Acabo de reservar mi turno en *ACE Masajes (Alma, Cuerpo, Espíritu)*:

💆 *Servicio:* ${selectedService.name}
📅 *Fecha:* ${friendlyDate}
⏰ *Hora:* ${selectedTime} hs
👤 *Nombre:* ${formData.client_name}
📍 *Dirección:* ${formData.client_address}

Adjunto aquí mi comprobante de transferencia de la seña ($10.000) a la cuenta de Reba para asegurar mi lugar. ¡Muchas gracias!`;

      const directVoucherLink = `https://wa.me/5493415148958?text=${encodeURIComponent(voucherMsg)}`;

      // Open WhatsApp automatically in a new tab for seamless user experience
      window.open(directVoucherLink, '_blank');

      setBookingResult({
        ...result,
        whatsapp: {
          ...result.whatsapp,
          directLink: directVoucherLink
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Ocurrió un error al registrar el turno. Por favor intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setBookingResult(null);
    setStep(1);
    setSelectedTime(null);
    setFormData({
      client_name: '',
      client_address: '',
      client_phone: '',
      client_notes: ''
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-bold text-stone-900 tracking-tight">
          ACE Masajes
        </h1>
        <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto font-light italic">
          — Alma, Cuerpo, Espíritu —
        </p>
      </div>

      {/* Steps Progress Indicator (4 Steps) */}
      <div className="mb-10 max-w-3xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
          
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-2xl transition-all ${
              step === 1
                ? 'bg-spa-800 text-white shadow-md shadow-spa-900/10 font-bold'
                : step > 1
                ? 'bg-spa-100 text-spa-900 font-semibold'
                : 'bg-stone-100 text-stone-400 font-medium'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
              step > 1 ? 'bg-spa-700 text-white' : step === 1 ? 'bg-gold-400 text-spa-950 font-bold' : 'bg-stone-200 text-stone-500'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-xs sm:text-sm truncate">1. Servicio</span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            disabled={!selectedService}
            onClick={() => selectedService && setStep(2)}
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-2xl transition-all ${
              step === 2
                ? 'bg-spa-800 text-white shadow-md shadow-spa-900/10 font-bold'
                : step > 2
                ? 'bg-spa-100 text-spa-900 font-semibold'
                : 'bg-stone-100 text-stone-400 font-medium'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
              step > 2 ? <Check className="w-4 h-4" /> : step === 2 ? 'bg-gold-400 text-spa-950 font-bold' : 'bg-stone-200 text-stone-500'
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-xs sm:text-sm truncate">2. Fecha y Hora</span>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            disabled={!selectedService || !selectedTime}
            onClick={() => selectedService && selectedTime && setStep(3)}
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-2xl transition-all ${
              step === 3
                ? 'bg-spa-800 text-white shadow-md shadow-spa-900/10 font-bold'
                : step > 3
                ? 'bg-spa-100 text-spa-900 font-semibold'
                : 'bg-stone-100 text-stone-400 font-medium'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
              step > 3 ? <Check className="w-4 h-4" /> : step === 3 ? 'bg-gold-400 text-spa-950 font-bold' : 'bg-stone-200 text-stone-500'
            }`}>
              {step > 3 ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <span className="text-xs sm:text-sm truncate">3. Tus Datos</span>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            disabled={!selectedService || !selectedTime || !formData.client_name || !formData.client_phone}
            onClick={() => selectedService && selectedTime && formData.client_name && formData.client_phone && setStep(4)}
            className={`flex items-center gap-2 p-2 sm:p-3 rounded-2xl transition-all ${
              step === 4
                ? 'bg-spa-800 text-white shadow-md shadow-spa-900/10 font-bold'
                : 'bg-stone-100 text-stone-400 font-medium'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
              step === 4 ? 'bg-gold-400 text-spa-950 font-bold' : 'bg-stone-200 text-stone-500'
            }`}>
              4
            </div>
            <span className="text-xs sm:text-sm truncate">4. Seña ($10.000)</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <ServiceSelector
          services={services}
          selectedService={selectedService}
          onSelectService={setSelectedService}
          onNext={() => setStep(2)}
        />
      )}

      {/* STEP 2: SELECT DATE & TIME */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-spa-100 text-spa-800">
              <Sparkles className="w-3.5 h-3.5 text-spa-600" />
              Paso 2 de 4
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
              Elige Día y Horario
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Seleccionaste: <strong>{selectedService?.name}</strong> ({selectedService?.duration} min).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6">
              <CalendarPicker
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
              />
            </div>
            <div className="lg:col-span-6">
              <TimeSlotPicker
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                availability={availability}
                loading={loadingAvailability}
                selectedDateFriendly={friendlyDate}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cambiar Servicio
            </button>

            <button
              type="button"
              disabled={!selectedTime}
              onClick={() => setStep(3)}
              className={`px-8 py-3.5 rounded-2xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                selectedTime
                  ? 'bg-spa-800 text-white hover:bg-spa-900 hover:shadow-lg shadow-spa-900/20 active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              Continuar a Datos Personales
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CLIENT DETAILS FORM */}
      {step === 3 && (
        <ClientDetailsForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={() => setStep(4)}
          onBack={() => setStep(2)}
          selectedService={selectedService}
          selectedDateFriendly={friendlyDate}
          selectedTime={selectedTime}
          loading={false}
        />
      )}

      {/* STEP 4: DEPOSIT PAYMENT AND CONFIRMATION */}
      {step === 4 && (
        <DepositPaymentStep
          selectedService={selectedService}
          selectedDateFriendly={friendlyDate}
          selectedTime={selectedTime}
          formData={formData}
          onBack={() => setStep(3)}
          onConfirm={handleCreateBooking}
          loading={submitting}
        />
      )}

      {/* SUCCESS MODAL */}
      {bookingResult && (
        <BookingSuccessModal
          appointment={bookingResult.appointment}
          whatsappData={bookingResult.whatsapp}
          onClose={() => setBookingResult(null)}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
