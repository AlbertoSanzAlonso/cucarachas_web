import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const BARCELONA = { lat: 41.3874, lng: 2.1686, zoom: 12 };
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AddressPicker = ({ value, onChange, disabled, variant = 'dark' }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const searchTimer = useRef(null);

  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isLight = variant === 'light';

  const setPosition = useCallback(
    (lat, lng, label) => {
      const map = mapInstance.current;
      if (!map) return;
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: !disabled }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
      const address = label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setQuery(address);
      onChange?.({ address, lat, lng });
    },
    [disabled, onChange]
  );

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const res = await fetch(
          `${API_BASE}/api/geo/reverse/?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
        );
        const data = await res.json();
        if (data.label) {
          setQuery(data.label);
          onChange?.({ address: data.label, lat, lng });
        } else {
          onChange?.({ address: query || `${lat}, ${lng}`, lat, lng });
        }
      } catch {
        onChange?.({ address: query || `${lat}, ${lng}`, lat, lng });
      }
    },
    [onChange, query]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [BARCELONA.lat, BARCELONA.lng],
      zoom: BARCELONA.zoom,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
      if (disabled) return;
      const { lat, lng } = e.latlng;
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: !disabled }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      map.setView([lat, lng], Math.max(map.getZoom(), 15));
      reverseGeocode(lat, lng);
    });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mapa solo al montar
  }, []);

  useEffect(() => {
    if (value && value !== query) setQuery(value);
  }, [value]);

  const runSearch = (text) => {
    const q = text.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    fetch(`${API_BASE}/api/geo/search/?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => setSuggestions(data.results || []))
      .catch(() => setSuggestions([]))
      .finally(() => setIsSearching(false));
  };

  const onQueryChange = (text) => {
    setQuery(text);
    onChange?.({ address: text, lat: null, lng: null });
    setShowSuggestions(true);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runSearch(text), 450);
  };

  const pickSuggestion = (item) => {
    setShowSuggestions(false);
    setSuggestions([]);
    setPosition(item.lat, item.lng, item.label);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t('agent.geolocation_not_supported'));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition(lat, lng, null);
        reverseGeocode(lat, lng).finally(() => setIsLocating(false));
      },
      () => {
        alert(t('agent.geolocation_denied'));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const inputClass = `w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent-green/50 ${
    isLight
      ? 'bg-white border-gray-200 text-secondary-gray placeholder:text-gray-400'
      : 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
  }`;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={t('agent.booking.address_placeholder')}
          disabled={disabled}
          autoComplete="street-address"
          className={inputClass}
        />
        {isSearching && (
          <Loader2
            size={18}
            className={`absolute right-3 top-1/2 -translate-y-1/2 animate-spin ${
              isLight ? 'text-gray-400' : 'text-white/40'
            }`}
          />
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            className={`absolute z-[500] left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-xl border shadow-lg text-left text-xs ${
              isLight ? 'bg-white border-gray-200' : 'bg-[#0a3d5c] border-white/10'
            }`}
          >
            {suggestions.map((s, i) => (
              <li key={`${s.lat}-${i}`}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-accent-green/10 ${
                    isLight ? 'text-secondary-gray' : 'text-white/90'
                  }`}
                  onClick={() => pickSuggestion(s)}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        ref={mapRef}
        className={`w-full h-[140px] rounded-xl overflow-hidden border ${
          isLight ? 'border-gray-200' : 'border-white/10'
        }`}
        data-lenis-prevent
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={disabled || isLocating}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
            isLight
              ? 'bg-white border border-gray-200 text-primary-blue'
              : 'bg-white/5 border border-white/10 text-white/80'
          }`}
        >
          {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          {t('agent.booking.use_gps')}
        </button>
      </div>

      <p className={`text-[10px] leading-snug ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
        <MapPin size={12} className="inline mr-1 -mt-0.5" />
        {t('agent.booking.address_hint')}
      </p>
    </div>
  );
};

export default AddressPicker;
