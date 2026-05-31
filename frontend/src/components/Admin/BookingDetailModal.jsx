import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Trash2, ExternalLink, X, Pencil } from 'lucide-react';

export const getBookingDisplayTitle = (booking) => {
  const clientName = booking.attendees?.[0]?.name?.trim();
  if (clientName) {
    return `Primera revisió amb ${clientName}`;
  }
  return booking.title || 'Visita tècnica';
};

const BookingDetailModal = ({ booking, onClose, onRequestCancel, onRequestEdit }) => {
  if (!booking) return null;

  const location =
    typeof booking.location === 'string'
      ? booking.location
      : booking.metadata?.address;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary-gray/20 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary-blue/5 rounded-2xl text-primary-blue">
                <CalendarIcon size={24} />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    booking.status === 'accepted'
                      ? 'bg-green-100 text-green-600'
                      : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {booking.status}
                </span>
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-50 rounded-xl text-primary-gray/30 hover:text-red-500 transition-colors"
                  aria-label="Tancar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <h3 className="font-black text-xl text-primary-gray mb-5 leading-tight">
              {getBookingDisplayTitle(booking)}
            </h3>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-primary-gray/60 font-medium">
                <Clock size={16} className="mr-3 text-primary-blue shrink-0" />
                {booking.startTime
                  ? new Date(booking.startTime).toLocaleString('ca-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </div>
              <div className="flex items-center text-sm text-primary-gray/60 font-medium">
                <User size={16} className="mr-3 text-primary-blue shrink-0" />
                {booking.attendees?.[0]?.name || 'Client'}
              </div>
              {location && (
                <div className="text-xs text-primary-gray/50 font-medium pl-7 leading-relaxed">
                  {location}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={onRequestEdit}
                disabled={!booking.uid}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary-blue/5 text-primary-blue hover:bg-primary-blue/10 transition-colors disabled:opacity-40 font-bold text-sm"
              >
                <Pencil size={18} />
                Editar
              </button>
              <button
                type="button"
                onClick={onRequestCancel}
                disabled={!booking.uid}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40 font-bold text-sm"
              >
                <Trash2 size={18} />
                Cancel·lar
              </button>
              <a
                href={booking.uid ? `https://app.cal.eu/bookings/${booking.uid}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 text-primary-gray/60 hover:bg-gray-100 transition-colors font-bold text-sm px-4"
                title="Obrir a Cal.com"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingDetailModal;
