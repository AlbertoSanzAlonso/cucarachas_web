import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';

function groupSlotsByDate(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

function parseSlotDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function formatWeekday(dateStr, locale) {
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(parseSlotDate(dateStr));
}

const STYLES = {
  dark: {
    dayBtn:
      'bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white transition-all text-center backdrop-blur-sm',
    timeBtn:
      'bg-white/10 hover:bg-accent-green hover:text-black border border-white/10 rounded-xl p-3 text-sm font-bold text-white transition-all text-center backdrop-blur-sm',
    backBtn:
      'flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-accent-green transition-colors mb-2',
    label: 'text-[10px] font-black uppercase tracking-wider text-white/50 mb-2',
    selectedDay: 'text-xs font-bold text-white/80 mb-2 capitalize',
  },
  light: {
    dayBtn:
      'bg-white hover:bg-accent-green hover:text-primary-blue border border-gray-100 rounded-2xl p-4 text-sm font-black text-secondary-gray transition-all text-center shadow-sm hover:shadow-lg hover:-translate-y-1',
    timeBtn:
      'bg-white hover:bg-accent-green hover:text-primary-blue border border-gray-100 rounded-2xl p-3 text-sm font-black text-secondary-gray transition-all text-center shadow-sm hover:shadow-lg',
    backBtn:
      'flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-secondary-gray/50 hover:text-primary-blue transition-colors mb-2',
    label: 'text-[10px] font-black uppercase tracking-wider text-secondary-gray/50 mb-2',
    selectedDay: 'text-xs font-bold text-secondary-gray mb-2 capitalize',
  },
};

const SlotPicker = ({ slots, onSlotSelect, variant = 'dark' }) => {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(null);

  const grouped = useMemo(() => groupSlotsByDate(slots), [slots]);
  const dates = useMemo(() => Object.keys(grouped), [grouped]);
  const styles = STYLES[variant] || STYLES.dark;

  if (selectedDate) {
    const daySlots = grouped[selectedDate] || [];
    return (
      <div className="mt-2 w-full">
        <button type="button" onClick={() => setSelectedDate(null)} className={styles.backBtn}>
          <ChevronLeft size={14} />
          {t('agent.slots.back_to_days')}
        </button>
        <p className={styles.selectedDay}>
          {formatWeekday(selectedDate, i18n.language)} · {selectedDate}
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

  return (
    <div className="mt-2 w-full">
      <p className={styles.label}>{t('agent.slots.choose_day')}</p>
      <div className="grid grid-cols-2 gap-2">
        {dates.map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => setSelectedDate(date)}
            className={styles.dayBtn}
          >
            <div className="opacity-60 text-[10px] uppercase mb-1 capitalize">
              {formatWeekday(date, i18n.language)}
            </div>
            <div>{date}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlotPicker;
