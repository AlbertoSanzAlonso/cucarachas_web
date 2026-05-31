import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, startOfDay } from 'date-fns';
import { ca } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/components/Admin/adminCalendar.css';
import BookingDetailModal, { getBookingDisplayTitle } from '@/components/Admin/BookingDetailModal';
import BookingEditModal from '@/components/Admin/BookingEditModal';
import ConfirmModal from '@/components/Admin/ConfirmModal';

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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
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

  const handleRequestCancel = () => {
    setCancelError(null);
    setShowCancelConfirm(true);
  };

  const handleCloseCancelConfirm = () => {
    if (isCancelling) return;
    setShowCancelConfirm(false);
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    const bookingUid = selectedBooking?.uid;
    if (!bookingUid) return;

    setIsCancelling(true);
    setCancelError(null);
    try {
      const response = await fetch(`${API_BASE}/api/cal/bookings/${bookingUid}/cancel/`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (response.ok) {
        setShowCancelConfirm(false);
        setSelectedBooking(null);
        fetchBookings();
      } else {
        setCancelError('No s\'ha pogut cancel·lar la cita. Torna-ho a provar.');
      }
    } catch {
      setCancelError('Error de connexió en cancel·lar la cita.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSelectEvent = useCallback((event) => {
    setSelectedBooking(event.resource);
  }, []);

  const handleDrillDown = useCallback((date) => {
    setCurrentDate(startOfDay(date));
    setCurrentView('day');
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    if (currentView !== 'month' && currentView !== 'week') return;
    setCurrentDate(startOfDay(slotInfo.start));
    setCurrentView('day');
  }, [currentView]);

  const getDrilldownView = useCallback((_date, view) => {
    if (view === 'day') return null;
    return 'day';
  }, []);

  const handleRequestEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
  };

  const handleEditSaved = () => {
    setSelectedBooking(null);
    fetchBookings();
  };

  const eventPropGetter = useCallback((_event, _start, _end, isSelected) => ({
    className: isSelected ? 'admin-cal-event admin-cal-event--selected' : 'admin-cal-event',
  }), []);

  const calendarComponents = useMemo(() => ({
    event: ({ event, title }) => (
      <div className="admin-cal-event__inner">
        <span className="admin-cal-event__title">{title}</span>
        {event.resource?.attendees?.[0]?.name && (
          <span className="admin-cal-event__meta">{event.resource.attendees[0].name}</span>
        )}
      </div>
    ),
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

            <div className="admin-calendar-wrapper" data-lenis-prevent>
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
                selectable={currentView === 'month' || currentView === 'week'}
                drilldownView="day"
                getDrilldownView={getDrilldownView}
                doShowMoreDrillDown
                popup
                onDrillDown={handleDrillDown}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventPropGetter}
                components={calendarComponents}
                style={{ height: '100%', minHeight: 0 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRequestCancel={handleRequestCancel}
          onRequestEdit={handleRequestEdit}
        />
      )}

      <BookingEditModal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        booking={selectedBooking}
        token={token}
        onSaved={handleEditSaved}
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={handleCloseCancelConfirm}
        onConfirm={handleConfirmCancel}
        title="Cancel·lar cita"
        message={
          selectedBooking
            ? `Estàs segur que vols cancel·lar «${getBookingDisplayTitle(selectedBooking)}»? Aquesta acció no es pot desfer.`
            : 'Estàs segur que vols cancel·lar aquesta cita?'
        }
        confirmLabel="Sí, cancel·lar"
        cancelLabel="No, tornar"
        variant="danger"
        isLoading={isCancelling}
        error={cancelError}
      />
    </div>
  );
};

export default CalendarManager;
