import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

function toIsoStart(dateStr, timeStr) {
  if (!dateStr) return null;
  const t = timeStr || '00:00';
  return `${dateStr}T${t}:00`;
}

/** Normaliza citas de la agenda propia al shape usado por leads / cards. */
export function normalizeAgendaAppointment(apt) {
  if (!apt) return null;
  const startTime = apt.startTime?.includes('T')
    ? apt.startTime
    : toIsoStart(apt.date, apt.startTime);
  return {
    ...apt,
    uid: apt.id,
    id: apt.id,
    startTime,
    start: startTime,
    title: apt.serviceName || 'Primera revisió',
    status: apt.status === 'confirmed' ? 'accepted' : apt.status,
    attendees: [
      {
        name: apt.customerName,
        email: apt.customerEmail || '',
        phoneNumber: apt.customerPhone,
      },
    ],
    location: apt.customerAddress || null,
    metadata: { address: apt.customerAddress || '' },
  };
}

export function useAgendaBookings({ daysBack = 30, daysAhead = 90 } = {}) {
  const token = useSelector((state) => state.auth.token);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const from = new Date();
      from.setDate(from.getDate() - daysBack);
      const to = new Date();
      to.setDate(to.getDate() + daysAhead);
      const params = new URLSearchParams({
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      });
      const response = await fetch(`${API_BASE}/api/agenda/appointments?${params}`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching appointments');
      }
      const list = Array.isArray(data.appointments) ? data.appointments : [];
      setBookings(list.map(normalizeAgendaAppointment).filter(Boolean));
    } catch {
      setIsError(true);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, daysBack, daysAhead]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, isError, refetch: fetchBookings };
}

/** @deprecated Usa useAgendaBookings */
export function useCalBookings(opts) {
  return useAgendaBookings(opts);
}
