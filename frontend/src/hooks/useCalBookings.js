import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

export function useCalBookings() {
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
      const response = await fetch(`${API_BASE}/api/cal/bookings/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.status === 'success') {
        let bookingsList = [];
        if (data.data && Array.isArray(data.data.bookings)) {
          bookingsList = data.data.bookings;
        } else if (Array.isArray(data.data)) {
          bookingsList = data.data;
        }
        setBookings(
          bookingsList.map((b) => ({
            ...b,
            startTime: b.startTime || b.start,
          }))
        );
      } else {
        throw new Error(data.message || data.error || 'Error fetching bookings');
      }
    } catch {
      setIsError(true);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, isLoading, isError, refetch: fetchBookings };
}
