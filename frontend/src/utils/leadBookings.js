export function syntheticEmailFromPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const suffix = digits.slice(-12) || 'web';
  return `cita+${suffix}@cucarachasbarcelona.cat`;
}

function getAttendee(booking) {
  return booking?.attendees?.[0] || booking?.attendee || {};
}

export function getBookingAttendeeEmail(booking) {
  return (getAttendee(booking).email || booking?.customerEmail || '').trim().toLowerCase();
}

function normalizePhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function phonesMatch(a, b) {
  const da = normalizePhoneDigits(a);
  const db = normalizePhoneDigits(b);
  if (!da || !db) return false;
  const minLen = 9;
  return da.endsWith(db.slice(-minLen)) || db.endsWith(da.slice(-minLen));
}

export function bookingMatchesLead(booking, lead) {
  if (!booking || !lead) return false;

  const attendeeEmail = getBookingAttendeeEmail(booking);
  const leadEmail = (lead.email || '').trim().toLowerCase();

  if (leadEmail && attendeeEmail && leadEmail === attendeeEmail) {
    return true;
  }

  const attendee = getAttendee(booking);
  const bookingPhone = attendee.phoneNumber || booking.customerPhone;
  if (phonesMatch(lead.phone, bookingPhone)) {
    return true;
  }

  if (lead.phone && attendeeEmail === syntheticEmailFromPhone(lead.phone)) {
    return true;
  }

  const attendeeName = (attendee.name || booking.customerName || '').trim().toLowerCase();
  const leadName = (lead.name || '').trim().toLowerCase();
  if (leadName && attendeeName && leadName === attendeeName) {
    return true;
  }

  return false;
}

export function filterBookingsForLead(bookings, lead) {
  return (bookings || [])
    .filter((booking) => bookingMatchesLead(booking, lead))
    .sort((a, b) => new Date(b.startTime || b.start || 0) - new Date(a.startTime || a.start || 0));
}

export function getBookingAddress(booking) {
  if (typeof booking.location === 'string' && booking.location) return booking.location;
  if (booking.location?.address) return booking.location.address;
  if (booking.customerAddress) return booking.customerAddress;
  return booking.metadata?.address || '';
}

export function getBookingStatusClass(status) {
  if (status === 'accepted' || status === 'confirmed') return 'bg-green-100 text-green-600';
  if (status === 'cancelled') return 'bg-red-100 text-red-500';
  if (status === 'pending' || status === 'no_show') return 'bg-orange-100 text-orange-600';
  return 'bg-blue-100 text-blue-600';
}
