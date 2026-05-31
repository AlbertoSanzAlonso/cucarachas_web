import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BookingContactForm = ({
  slot,
  step = 'name',
  bookingName = '',
  onNameNext,
  onSubmit,
  disabled,
  variant = 'dark',
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(bookingName || '');
  const [phone, setPhone] = useState('');
  const isLight = variant === 'light';

  const inputClass = `w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-green/50 ${
    isLight
      ? 'bg-white border-gray-200 text-secondary-gray placeholder:text-gray-400'
      : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
  }`;

  const handleNameStep = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || disabled) return;
    onNameNext(trimmed);
  };

  const handlePhoneStep = (e) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    const finalName = (bookingName || name).trim();
    if (!finalName || !trimmedPhone || disabled) return;
    onSubmit({ name: finalName, phone: trimmedPhone, slot });
  };

  return (
    <form
      onSubmit={step === 'name' ? handleNameStep : handlePhoneStep}
      className={`mt-3 p-4 rounded-2xl border space-y-3 text-left w-full max-w-[320px] ${
        isLight ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-white/5'
      }`}
    >
      <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-white/50'}`}>
        {t('agent.booking.form_hint', { date: slot.date, time: slot.time })}
      </p>

      {step === 'name' ? (
        <>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('agent.booking.name_placeholder')}
            required
            autoComplete="name"
            autoFocus
            disabled={disabled}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={disabled || !name.trim()}
            className={`w-full disabled:opacity-50 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all ${
              isLight
                ? 'bg-primary-blue text-white hover:opacity-90'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            {t('agent.booking.continue')}
          </button>
        </>
      ) : (
        <>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('agent.booking.phone_placeholder')}
            required
            autoComplete="tel"
            autoFocus
            disabled={disabled}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={disabled || !phone.trim()}
            className="w-full bg-accent-green hover:bg-accent-green-hv disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
          >
            {t('agent.booking.submit')}
          </button>
        </>
      )}
    </form>
  );
};

export default BookingContactForm;
