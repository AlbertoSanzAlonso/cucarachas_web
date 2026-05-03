import React from 'react';
import { Send, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const ChatInput = ({ inputValue, setInputValue, onSendMessage }) => {
  const { t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(t('agent.geolocation_not_supported', 'La geolocalización no está soportada por tu navegador.'));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Intentamos usar Google Maps si la API key está disponible, sino un fallback gratuito (Nominatim)
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          let address = '';

          if (apiKey) {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              address = data.results[0].formatted_address;
            }
          } else {
            // Fallback a OpenStreetMap si no hay API Key de Google configurada en el frontend
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.display_name) {
              address = data.display_name;
            }
          }

          if (address) {
            // Auto-rellenar y enviar con formato de "supervisión"
            const msg = `📍 Mi ubicación GPS detectada es: ${address}. ¿Es correcta para la inspección?`;
            setInputValue(msg);
          } else {
            alert(t('agent.geolocation_error', 'No se pudo obtener la dirección.'));
          }
        } catch (error) {
          console.error("Error fetching geocoding: ", error);
          alert(t('agent.geolocation_error', 'Hubo un error al procesar tu ubicación.'));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("GPS Error: ", error);
        alert(t('agent.geolocation_denied', 'Permiso de ubicación denegado.'));
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="p-4 bg-white/5 border-t border-white/10">
      <form onSubmit={onSendMessage} className="relative flex items-center">
        <button 
          type="button" 
          onClick={handleGetLocation}
          disabled={isLocating}
          title="Compartir mi ubicación"
          className="absolute left-2 p-2 text-white/50 hover:text-accent-green transition-colors disabled:opacity-50 z-10"
        >
          {isLocating ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
        </button>
        <input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('agent.chat_placeholder', 'Escribe tu mensaje...')}
          className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-14 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-green/50 transition-all"
        />
        <button type="submit" className="absolute right-2 p-3 bg-accent-green text-black rounded-full hover:bg-accent-green-hv transition-all shadow-lg">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
