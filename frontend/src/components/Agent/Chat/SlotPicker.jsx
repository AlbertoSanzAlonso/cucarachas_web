import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';

/** Horizont máximo de reserva: 2 semanas vista. */
const MAX_DAYS_AHEAD = 14;

function parseSlotDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Lunes de la semana (calendario EU). */
function getWeekStart(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function weekKeyFromDate(date) {
  const monday = getWeekStart(date);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function filterSlotsWithinHorizon(slots, maxDays = MAX_DAYS_AHEAD) {
  const today = startOfDay(new Date());
  const limit = new Date(today);
  limit.setDate(limit.getDate() + maxDays);
  return slots.filter((slot) => {
    const d = parseSlotDate(slot.date);
    if (!d || Number.isNaN(d.getTime())) return false;
    const day = startOfDay(d);
    return day >= today && day <= limit;
  });
}

function groupSlotsByDate(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

function groupDatesByWeek(dates) {
  const weeks = new Map();
  for (const dateStr of dates) {
    const d = parseSlotDate(dateStr);
    if (!d) continue;
    const key = weekKeyFromDate(d);
    if (!weeks.has(key)) {
      weeks.set(key, { key, monday: getWeekStart(d), dates: [] });
    }
    weeks.get(key).dates.push(dateStr);
  }
  return Array.from(weeks.values()).sort((a, b) => a.monday - b.monday);
}

function formatWeekday(dateStr, locale) {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(parseSlotDate(dateStr));
}

function formatShortDate(date, locale) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

function weekLabel(week, locale, t) {
  const thisMonday = getWeekStart(new Date());
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  if (week.monday.getTime() === thisMonday.getTime()) {
    return t('agent.slots.this_week');
  }
  if (week.monday.getTime() === nextMonday.getTime()) {
    return t('agent.slots.next_week');
  }

  const first = parseSlotDate(week.dates[0]);
  const last = parseSlotDate(week.dates[week.dates.length - 1]);
  return t('agent.slots.week_range', {
    start: formatShortDate(first, locale),
    end: formatShortDate(last, locale),
  });
}

const STYLES = {
  dark: {
    dayBtn:
      'bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white transition-all text-center backdrop-blur-sm',
    timeBtn:
      'bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white transition-all text-center backdrop-blur-sm',
    weekBtn:
      'bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white transition-all text-left backdrop-blur-sm',
    backBtn:
      'flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-accent-green transition-colors mb-2',
    label: 'text-[10px] font-black uppercase tracking-wider text-white/50 mb-2',
    selectedDay: 'text-xs font-bold text-white/80 mb-2 capitalize',
    meta: 'opacity-60 text-[10px] uppercase mt-1',
  },
  light: {
    dayBtn:
      'bg-white hover:bg-accent-green hover:text-primary-blue border border-gray-100 rounded-2xl p-4 text-sm font-black text-secondary-gray transition-all text-center shadow-sm hover:shadow-lg hover:-translate-y-1',
    timeBtn:
      'bg-white hover:bg-accent-green hover:text-primary-blue border border-gray-100 rounded-2xl p-3 text-sm font-black text-secondary-gray transition-all text-center shadow-sm hover:shadow-lg',
    weekBtn:
      'bg-white hover:bg-accent-green hover:text-primary-blue border border-gray-100 rounded-2xl p-4 text-sm font-black text-secondary-gray transition-all text-left shadow-sm hover:shadow-lg hover:-translate-y-1',
    backBtn:
      'flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-secondary-gray/50 hover:text-primary-blue transition-colors mb-2',
    label: 'text-[10px] font-black uppercase tracking-wider text-secondary-gray/50 mb-2',
    selectedDay: 'text-xs font-bold text-secondary-gray mb-2 capitalize',
    meta: 'opacity-40 text-[10px] uppercase mt-1 font-bold',
  },
};

const SlotPicker = ({ slots, onSlotSelect, variant = 'dark' }) => {
  const { t, i18n } = useTranslation();
  const [selectedWeekKey, setSelectedWeekKey] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const filteredSlots = useMemo(
    () => filterSlotsWithinHorizon(slots || [], MAX_DAYS_AHEAD),
    [slots],
  );
  const grouped = useMemo(() => groupSlotsByDate(filteredSlots), [filteredSlots]);
  const dates = useMemo(() => Object.keys(grouped), [grouped]);
  const weeks = useMemo(() => groupDatesByWeek(dates), [dates]);
  const styles = STYLES[variant] || STYLES.dark;
  const locale = i18n.language;

  const selectedWeek = useMemo(
    () => weeks.find((w) => w.key === selectedWeekKey) || null,
    [weeks, selectedWeekKey],
  );

  if (!filteredSlots.length) {
    return null;
  }

  if (selectedDate) {
    const daySlots = grouped[selectedDate] || [];
    return (
      <div className="mt-2 w-full">
        <button
          type="button"
          onClick={() => setSelectedDate(null)}
          className={styles.backBtn}
        >
          <ChevronLeft size={14} />
          {t('agent.slots.back_to_days')}
        </button>
        <p className={styles.selectedDay}>
          {formatWeekday(selectedDate, locale)} · {selectedDate}
        </p>
        <p className={styles.label}>{t('agent.slots.choose_time')}</p>
        <div className="grid grid-cols-3 gap-2">
          {daySlots.map((slot) => (
            <button
              key={slot.id ?? `${slot.date}-${slot.time}`}
              type="button"
              onClick={() => onSlotSelect(slot)}
              className={styles.timeBtn}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (selectedWeek) {
    return (
      <div className="mt-2 w-full">
        <button
          type="button"
          onClick={() => setSelectedWeekKey(null)}
          className={styles.backBtn}
        >
          <ChevronLeft size={14} />
          {t('agent.slots.back_to_weeks')}
        </button>
        <p className={styles.selectedDay}>{weekLabel(selectedWeek, locale, t)}</p>
        <p className={styles.label}>{t('agent.slots.choose_day')}</p>
        <div className="grid grid-cols-2 gap-2">
          {selectedWeek.dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={styles.dayBtn}
            >
              <div className="opacity-60 text-[10px] uppercase mb-1 capitalize">
                {formatWeekday(date, locale)}
              </div>
              <div>{date}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 w-full">
      <p className={styles.label}>{t('agent.slots.choose_week')}</p>
      <div className="grid grid-cols-1 gap-2">
        {weeks.map((week) => (
          <button
            key={week.key}
            type="button"
            onClick={() => setSelectedWeekKey(week.key)}
            className={styles.weekBtn}
          >
            <div>{weekLabel(week, locale, t)}</div>
            <div className={styles.meta}>
              {t('agent.slots.week_days_available', { count: week.dates.length })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlotPicker;
