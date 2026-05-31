import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { ca } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/components/Admin/adminCalendar.css';
import BookingDetailModal, { getBookingDisplayTitle } from '@/components/Admin/BookingDetailModal';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

const locales = { ca };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: ca, weekStartsOn: 1 }),
  getDay,
  locales,
});

const CALENDAR_MESSAGES = {
  today: 'Avui',
  previous: 'Anterior',
  next: 'Següent',
  month: 'Mes',
  week: 'Setmana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Cita',
  noEventsInRange: 'No hi ha cites en aquest període.',
  showMore: (total) => `+${total} més`,
};

const toCalendarEvent = (booking) => {
  const start = new Date(booking.startTime);
  const endRaw = booking.end || booking.endTime;
  const end = endRaw ? new Date(endRaw) : addHours(start, 1);

  return {
    id: booking.uid || booking.id,
    title: getBookingDisplayTitle(booking),
    start,
    end: end > start ? end : addHours(start, 1),
    resource: booking,
  };
};

const CalendarManager = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const token = useSelector((state) => state.auth.token);

  const authHeaders = {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`${API_BASE}/api/cal/bookings/`, {
        headers: authHeaders,
      });
      const data = await response.json();

      if (data.status === 'success') {
        let bookingsList = [];
        if (data.data && Array.isArray(data.data.bookings)) {
          bookingsList = data.data.bookings;
        } else if (Array.isArray(data.data)) {
          bookingsList = data.data;
        }
        bookingsList = bookingsList
          .map((b) => ({
            ...b,
            startTime: b.startTime || b.start,
          }))
          .filter((b) => b.startTime && b.status !== 'cancelled');
        setBookings(bookingsList);
      } else {
        throw new Error(data.message || data.error || 'Error fetching bookings');
      }
    } catch (err) {
      console.error('ERROR Fetching Bookings:', err);
      setIsError(true);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const events = useMemo(
    () => bookings.map(toCalendarEvent).filter((e) => !Number.isNaN(e.start.getTime())),
    [bookings],
  );

  const handleCancel = async (bookingUid) => {
    if (!window.confirm('Estàs segur que vols cancel·lar aquesta cita?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/cal/bookings/${bookingUid}/cancel/`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (response.ok) {
        setSelectedBooking(null);
        fetchBookings();
      } else {
        alert('Error al cancel·lar la cita');
      }
    } catch {
      alert('Error al cancel·lar la cita');
    }
  };

  const handleSelectEvent = useCallback((event) => {
    setSelectedBooking(event.resource);
  }, []);

  const eventPropGetter = useCallback(() => ({
    style: {
      backgroundColor: 'var(--color-primary-blue)',
      borderColor: 'var(--color-primary-blue-hv)',
    },
  }), []);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-gray uppercase tracking-tight">
            Control d&apos;Agenda
          </h2>
          <p className="text-primary-gray/40 font-medium text-sm">
            Gestiona les teves cites en temps real
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-primary-blue"
          aria-label="Actualitzar agenda"
        >
          <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm"
          >
            <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4" />
            <p className="text-primary-gray/40 font-black uppercase tracking-widest text-xs">
              Sincronitzant amb Cal.com...
            </p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 bg-red-50 rounded-[3rem] border border-red-100 text-center"
          >
            <p className="text-red-600 font-bold mb-2">Error de connexió</p>
            <p className="text-red-400 text-sm">
              No s&apos;ha pogut obtenir l&apos;agenda. Verifica la clau API al servidor.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm"
          >
            {bookings.length === 0 && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-primary-gray/50 font-medium">
                <CalendarIcon size={18} className="text-primary-blue/40 shrink-0" />
                Actualment no tens cap reserva activa. El calendari es mostra buit.
              </div>
            )}

            <div className="admin-calendar-wrapper">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                culture="ca"
                messages={CALENDAR_MESSAGES}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                views={['month', 'week', 'day']}
                defaultView="week"
                step={30}
                timeslots={2}
                min={new Date(1970, 0, 1, 7, 0, 0)}
                max={new Date(1970, 0, 1, 21, 0, 0)}
                selectable={false}
                popup
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventPropGetter}
                style={{ height: '100%' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default CalendarManager;
