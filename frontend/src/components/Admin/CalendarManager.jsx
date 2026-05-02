import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Mail, Trash2, ExternalLink, RefreshCcw, Settings, Sliders } from 'lucide-react';
import { useSelector } from 'react-redux';
import { AvailabilitySettings, EventTypeSettings } from "@calcom/atoms";

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';
const CAL_ACCESS_TOKEN = import.meta.env.VITE_CAL_ACCESS_TOKEN;

const CalendarManager = () => {
  const [activeTab, setActiveTab] = useState('bookings');
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
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

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

  const tabs = [
    { id: 'bookings', label: 'Cites Actives', icon: <CalendarIcon size={18} /> },
    { id: 'availability', label: 'Disponibilitat', icon: <Clock size={18} /> },
    { id: 'eventTypes', label: 'Tipus d\'Event', icon: <Settings size={18} /> },
  ];

  const NoTokenMessage = () => (
    <div className="p-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center">
      <Sliders size={48} className="mx-auto text-primary-blue/20 mb-6" />
      <h3 className="text-xl font-black text-primary-gray uppercase tracking-tight mb-2">Configuració Necessària</h3>
      <p className="text-primary-gray/40 font-medium mb-6">
        Per gestionar la disponibilitat des d'aquí, necessitem configurar el teu <span className="font-bold">Cal.com Access Token</span>.
      </p>
      <div className="bg-gray-50 p-4 rounded-2xl text-xs font-mono text-left max-w-md mx-auto mb-6">
        # Afegeix això al teu .env del frontend:<br/>
        VITE_CAL_ACCESS_TOKEN=el_teu_token_aqui
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-gray uppercase tracking-tight">Control d'Agenda</h2>
          <p className="text-primary-gray/40 font-medium text-sm">Gestiona cites i disponibilitat en temps real</p>
        </div>
        
        <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-primary-blue shadow-sm' 
                  : 'text-primary-gray/40 hover:text-primary-gray'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4" />
                <p className="text-primary-gray/40 font-black uppercase tracking-widest text-xs">Sincronitzant cites...</p>
              </div>
            ) : isError ? (
              <div className="p-12 bg-red-50 rounded-[3rem] border border-red-100 text-center">
                <p className="text-red-600 font-bold mb-2">Error de connexió amb l'API</p>
                <p className="text-red-400 text-sm">Comprova la CAL_API_KEY al servidor.</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center">
                <CalendarIcon size={48} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-xl font-black text-primary-gray uppercase tracking-tight mb-2">Sense cites</h3>
                <p className="text-primary-gray/40 font-medium">No s'han trobat reserves actives.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <h3 className="font-black text-lg text-primary-gray mb-4 leading-tight">{booking.title}</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-primary-gray/60 font-medium">
                          <Clock size={16} className="mr-3 text-primary-blue" />
                          {new Date(booking.startTime).toLocaleString('ca-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center text-sm text-primary-gray/60 font-medium">
                          <User size={16} className="mr-3 text-primary-blue" />
                          {booking.attendees?.[0]?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-50 mt-4">
                      <button onClick={() => handleCancel(booking.id)} className="flex-1 flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                      <a href={`https://cal.com/booking/${booking.uid}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center p-3 rounded-xl bg-gray-50 text-primary-gray hover:bg-gray-100 transition-colors"><ExternalLink size={18} /></a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'availability' && (
          <motion.div
            key="availability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm overflow-hidden"
          >
            {!CAL_ACCESS_TOKEN ? <NoTokenMessage /> : <AvailabilitySettings />}
          </motion.div>
        )}

        {activeTab === 'eventTypes' && (
          <motion.div
            key="eventTypes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm overflow-hidden"
          >
            {!CAL_ACCESS_TOKEN ? <NoTokenMessage /> : (
               <div className="space-y-8">
                  <p className="text-primary-gray/40 text-sm font-medium">Aquí pots gestionar els teus serveis (Inspecció, Tractament Urgent, etc.)</p>
                  {/* Nota: EventTypeSettings necessita un ID. Podem mostrar una llista o el principal */}
                  <EventTypeSettings id={277401} />
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarManager;
