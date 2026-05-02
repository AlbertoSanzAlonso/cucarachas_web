import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Trash2, ExternalLink, RefreshCcw } from 'lucide-react';
import { useSelector } from 'react-redux';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

const CalendarManager = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const token = useSelector((state) => state.auth.token);

  const authHeaders = {
    'Authorization': `Token ${token}`,
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
        setBookings(data.data || []);
      } else {
        throw new Error(data.message || 'Error fetching bookings');
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Estàs segur que vols cancel·lar aquesta cita?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/cal/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (response.ok) {
        fetchBookings();
      } else {
        alert('Error al cancel·lar la cita');
      }
    } catch (err) {
      alert('Error al cancel·lar la cita');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-gray uppercase tracking-tight">Control d'Agenda</h2>
          <p className="text-primary-gray/40 font-medium text-sm">Gestiona les teves cites en temps real</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-primary-blue"
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
            <p className="text-primary-gray/40 font-black uppercase tracking-widest text-xs">Sincronitzant amb Cal.com...</p>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 bg-red-50 rounded-[3rem] border border-red-100 text-center"
          >
            <p className="text-red-600 font-bold mb-2">Error de connexió</p>
            <p className="text-red-400 text-sm">No s'ha pogut obtenir l'agenda. Verifica la clau API al servidor.</p>
          </motion.div>
        ) : bookings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center"
          >
            <CalendarIcon size={48} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-xl font-black text-primary-gray uppercase tracking-tight mb-2">Sense cites</h3>
            <p className="text-primary-gray/40 font-medium">Actualment no tens cap reserva activa.</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                layout
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-primary-blue/5 rounded-2xl text-primary-blue">
                      <CalendarIcon size={24} />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      booking.status === 'accepted' ? 'bg-green-100 text-green-600' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-500' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-primary-gray mb-4 leading-tight">
                    {booking.title || 'Visita Tècnica'}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-primary-gray/60 font-medium">
                      <Clock size={16} className="mr-3 text-primary-blue" />
                      {new Date(booking.startTime).toLocaleString('ca-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center text-sm text-primary-gray/60 font-medium">
                      <User size={16} className="mr-3 text-primary-blue" />
                      {booking.attendees?.[0]?.name || 'Client'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-50 mt-4">
                  <button onClick={() => handleCancel(booking.id)} className="flex-1 flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <a href={`https://cal.com/booking/${booking.uid}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center p-3 rounded-xl bg-gray-50 text-primary-gray hover:bg-gray-100 transition-colors">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarManager;
