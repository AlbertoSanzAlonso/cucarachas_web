import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, FileText } from 'lucide-react';
import { useUpdateLeadMutation } from '@/store/apis/leadsApi';

const emptyForm = {
  nombre: '',
  email: '',
  telefono: '',
  documento_fiscal: '',
};

const LeadEditModal = ({ isOpen, onClose, leadRaw }) => {
  const [form, setForm] = useState(emptyForm);
  const [updateLead, { isLoading, error }] = useUpdateLeadMutation();

  useEffect(() => {
    if (!isOpen || !leadRaw) return;
    setForm({
      nombre: leadRaw.nombre || '',
      email: leadRaw.email || '',
      telefono: leadRaw.telefono || '',
      documento_fiscal: leadRaw.documento_fiscal || '',
    });
  }, [isOpen, leadRaw]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadRaw?.id) return;

    try {
      await updateLead({
        id: leadRaw.id,
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        documento_fiscal: form.documento_fiscal.trim(),
      }).unwrap();
      onClose();
    } catch {
      // error shown via RTK Query `error`
    }
  };

  const apiError =
    error?.data?.documento_fiscal?.[0] ||
    error?.data?.email?.[0] ||
    error?.data?.nombre?.[0] ||
    error?.data?.telefono?.[0] ||
    error?.data?.detail ||
    (error ? 'No s\'ha pogut guardar el lead. Revisa les dades.' : null);

  return (
    <AnimatePresence>
      {isOpen && leadRaw && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
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
            aria-labelledby="lead-edit-title"
          >
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2
                    id="lead-edit-title"
                    className="text-xl md:text-2xl font-black text-primary-gray uppercase tracking-tight"
                  >
                    Editar lead
                  </h2>
                  <p className="text-sm text-primary-gray/40 font-medium mt-1">
                    Actualitza les dades del contacte
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
                  icon={User}
                  label="Nom"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Field
                  icon={Mail}
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Field
                  icon={Phone}
                  label="Telèfon"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <Field
                  icon={FileText}
                  label="Document fiscal"
                  name="documento_fiscal"
                  value={form.documento_fiscal}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {apiError && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {apiError}
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

const Field = ({ icon: Icon, label, name, type = 'text', value, onChange, required, disabled }) => (
  <div className="space-y-1.5">
    <label
      htmlFor={`lead-${name}`}
      className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 ml-1"
    >
      {label}
    </label>
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-gray/25" />
      <input
        id={`lead-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-blue/20 outline-none font-medium text-primary-gray text-sm transition-all disabled:opacity-50"
      />
    </div>
  </div>
);

export default LeadEditModal;
