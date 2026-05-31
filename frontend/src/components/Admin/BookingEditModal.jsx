import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, User, Phone } from 'lucide-react';
import { getBookingDisplayTitle } from '@/components/Admin/BookingDetailModal';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

const emptyForm = {
  startLocal: '',
  attendeeName: '',
  attendeePhone: '',
  address: '',
};

const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toUtcIso = (datetimeLocal) => {
  const d = new Date(datetimeLocal);
  return d.toISOString();
};

const getBookingAddress = (booking) => {
  if (typeof booking?.location === 'string') return booking.location;
  return booking?.metadata?.address || '';
};

const BookingEditModal = ({ isOpen, onClose, booking, token, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialStartLocal, setInitialStartLocal] = useState('');
  const [initialAddress, setInitialAddress] = useState('');

  useEffect(() => {
    if (!isOpen || !booking) return;
    const startLocal = toDatetimeLocal(booking.startTime);
    const address = getBookingAddress(booking);
    setForm({
      startLocal,
      attendeeName: booking.attendees?.[0]?.name || '',
      attendeePhone: booking.attendees?.[0]?.phoneNumber || booking.attendees?.[0]?.phone || '',
      address,
    });
    setInitialStartLocal(startLocal);
    setInitialAddress(address);
    setError(null);
  }, [isOpen, booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking?.uid || !token) return;

    const payload = {};
    if (form.startLocal && form.startLocal !== initialStartLocal) {
      payload.start = toUtcIso(form.startLocal);
    }
    if (form.address.trim() !== initialAddress.trim()) {
      payload.address = form.address.trim();
    }

    if (!payload.start && payload.address === undefined) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/cal/bookings/${booking.uid}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        onSaved?.();
        onClose();
      } else {
        setError(data.message || 'No s\'ha pogut actualitzar la cita.');
      }
    } catch {
      setError('Error de connexió en actualitzar la cita.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && booking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-primary-gray/20 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-edit-title"
          >
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2
                    id="booking-edit-title"
                    className="text-xl md:text-2xl font-black text-primary-gray uppercase tracking-tight"
                  >
                    Editar cita
                  </h2>
                  <p className="text-sm text-primary-gray/40 font-medium mt-1">
                    {getBookingDisplayTitle(booking)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 bg-gray-50 rounded-xl text-primary-gray/30 hover:text-red-500 transition-colors disabled:opacity-40"
                  aria-label="Tancar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <Field
                  icon={Clock}
                  label="Data i hora"
                  name="startLocal"
                  type="datetime-local"
                  value={form.startLocal}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Field
                  icon={User}
                  label="Nom del client"
                  name="attendeeName"
                  value={form.attendeeName}
                  onChange={handleChange}
                  disabled
                  hint="Nom visible a Cal.com (no editable des d'aquí)"
                />
                <Field
                  icon={Phone}
                  label="Telèfon"
                  name="attendeePhone"
                  type="tel"
                  value={form.attendeePhone}
                  onChange={handleChange}
                  disabled
                  hint="Contacte registrat a Cal.com"
                />
                <Field
                  icon={MapPin}
                  label="Adreça de la visita"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 p-3 rounded-xl bg-gray-50 text-primary-gray font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary-blue text-white font-bold text-sm hover:bg-[var(--primary-blue-hv)] transition-colors disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardant...
                    </>
                  ) : (
                    'Guardar canvis'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({
  icon: Icon,
  label,
  name,
  type = 'text',
  value,
  onChange,
  required,
  disabled,
  hint,
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={`booking-${name}`}
      className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 ml-1"
    >
      {label}
    </label>
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-gray/25" />
      <input
        id={`booking-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-medium text-primary-gray text-sm transition-all disabled:opacity-50"
      />
    </div>
    {hint && (
      <p className="text-[11px] text-primary-gray/35 font-medium ml-1">{hint}</p>
    )}
  </div>
);

export default BookingEditModal;
