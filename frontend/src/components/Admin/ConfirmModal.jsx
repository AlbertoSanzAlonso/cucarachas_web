import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acció',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancel·lar',
  variant = 'danger',
  isLoading = false,
  error = null,
}) => {
  const isDanger = variant === 'danger';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-primary-gray/30 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-5">
                <div
                  className={`p-3 rounded-2xl ${
                    isDanger ? 'bg-red-50 text-red-500' : 'bg-primary-blue/5 text-primary-blue'
                  }`}
                >
                  <AlertTriangle size={24} />
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

              <h3
                id="confirm-modal-title"
                className="font-black text-xl text-primary-gray mb-3 leading-tight"
              >
                {title}
              </h3>
              {message && (
                <p className="text-sm text-primary-gray/60 font-medium leading-relaxed mb-6">
                  {message}
                </p>
              )}

              {error && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 p-3 rounded-xl bg-gray-50 text-primary-gray font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-60 ${
                    isDanger
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-primary-blue hover:bg-[var(--color-primary-blue-hv)]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processant...
                    </>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
