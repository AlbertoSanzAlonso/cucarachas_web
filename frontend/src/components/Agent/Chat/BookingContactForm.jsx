import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BookingContactForm = ({ slot, onSubmit, disabled, variant = 'dark' }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const isLight = variant === 'light';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || disabled) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), slot });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-3 p-4 rounded-2xl border space-y-3 text-left w-full max-w-[320px] ${
        isLight ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-white/5'
      }`}
    >
      <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-white/50'}`}>
        {t('agent.booking.form_hint', { date: slot.date, time: slot.time })}
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('agent.booking.name_placeholder')}
        required
        autoComplete="name"
        disabled={disabled}
        className={`w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-green/50 ${
          isLight
            ? 'bg-white border-gray-200 text-secondary-gray placeholder:text-gray-400'
            : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
        }`}
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t('agent.booking.phone_placeholder')}
        required
        autoComplete="tel"
        disabled={disabled}
        className={`w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-green/50 ${
          isLight
            ? 'bg-white border-gray-200 text-secondary-gray placeholder:text-gray-400'
            : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
        }`}
      />
      <button
        type="submit"
        disabled={disabled || !name.trim() || !phone.trim()}
        className="w-full bg-accent-green hover:bg-accent-green-hv disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
      >
        {t('agent.booking.submit')}
      </button>
    </form>
  );
};

export default BookingContactForm;
