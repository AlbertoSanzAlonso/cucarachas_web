import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { getBookingDisplayTitle } from '@/components/Admin/BookingDetailModal';
import { getBookingAddress, getBookingStatusClass } from '@/utils/leadBookings';

export const formatBookingDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LeadBookingCard = ({ booking, index = 0 }) => {
  const address = getBookingAddress(booking);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="p-5 md:p-6 rounded-[2rem] border border-admin-border bg-admin-muted hover:bg-admin-muted transition-colors"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-black text-admin-text text-base md:text-lg">
            {getBookingDisplayTitle(booking)}
          </p>
          <p className="flex items-center gap-2 text-sm text-admin-text-muted font-medium mt-2">
            <Clock size={16} className="text-primary-blue shrink-0" />
            {formatBookingDate(booking.startTime)}
          </p>
        </div>
        <span
          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getBookingStatusClass(booking.status)}`}
        >
          {booking.status}
        </span>
      </div>

      {address && (
        <p className="flex items-start gap-2 text-sm text-admin-text-muted font-medium mb-4">
          <MapPin size={16} className="text-primary-blue shrink-0 mt-0.5" />
          {address}
        </p>
      )}

      {booking.uid && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">
          ID: {booking.uid.slice(0, 8)}…
        </p>
      )}
    </motion.div>
  );
};

export default LeadBookingCard;
