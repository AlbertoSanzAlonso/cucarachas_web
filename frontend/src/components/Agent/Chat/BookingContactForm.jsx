import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddressPicker from '@/components/Agent/Chat/AddressPicker';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const BookingContactForm = ({
  slot,
  step = 'name',
  bookingName = '',
  bookingAddress = '',
  bookingEmail = '',
  onNameNext,
  onAddressNext,
  onEmailNext,
  onSubmit,
  disabled,
  variant = 'dark',
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(bookingName || '');
  const [email, setEmail] = useState(bookingEmail || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(bookingAddress || '');
  const [coords, setCoords] = useState(null);
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

  const handleAddressStep = (e) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (trimmed.length < 5 || disabled) return;
    onAddressNext({
      name: (bookingName || name).trim(),
      address: trimmed,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      slot,
    });
  };

  const handleEmailStep = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail) || disabled) return;
    onEmailNext({
      name: (bookingName || name).trim(),
      email: trimmedEmail,
      address: (bookingAddress || address).trim(),
      slot,
    });
  };

  const handlePhoneStep = (e) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    const finalName = (bookingName || name).trim();
    const finalEmail = (bookingEmail || email).trim();
    const finalAddress = (bookingAddress || address).trim();
    if (!finalName || !isValidEmail(finalEmail) || !trimmedPhone || finalAddress.length < 5 || disabled) return;
    onSubmit({
      name: finalName,
      email: finalEmail,
      phone: trimmedPhone,
      address: finalAddress,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      slot,
    });
  };

  const continueBtnClass = `w-full disabled:opacity-50 font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all ${
    isLight
      ? 'bg-primary-blue text-white hover:opacity-90'
      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
  }`;

  const submitHandler =
    step === 'name'
      ? handleNameStep
      : step === 'address'
        ? handleAddressStep
        : step === 'email'
          ? handleEmailStep
          : handlePhoneStep;

  return (
    <form
      onSubmit={submitHandler}
      className={`mt-3 p-4 rounded-2xl border space-y-3 text-left w-full max-w-[320px] ${
        isLight ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-white/5'
      }`}
    >
      <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-white/50'}`}>
        {t('agent.booking.form_hint', { date: slot.date, time: slot.time })}
      </p>

      {step === 'name' && (
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
          <button type="submit" disabled={disabled || !name.trim()} className={continueBtnClass}>
            {t('agent.booking.continue')}
          </button>
        </>
      )}

      {step === 'address' && (
        <>
          <AddressPicker
            value={address}
            onChange={({ address: addr, lat, lng }) => {
              setAddress(addr);
              setCoords(lat != null && lng != null ? { lat, lng } : null);
            }}
            disabled={disabled}
            variant={variant}
          />
          <button
            type="submit"
            disabled={disabled || address.trim().length < 5}
            className={continueBtnClass}
          >
            {t('agent.booking.continue')}
          </button>
        </>
      )}

      {step === 'email' && (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('agent.booking.email_placeholder')}
            required
            autoComplete="email"
            autoFocus
            disabled={disabled}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={disabled || !isValidEmail(email)}
            className={continueBtnClass}
          >
            {t('agent.booking.continue')}
          </button>
        </>
      )}

      {step === 'phone' && (
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
