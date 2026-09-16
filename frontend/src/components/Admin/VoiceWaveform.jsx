import React from 'react';

const VoiceWaveform = ({ levels = [], active = false }) => (
  <div
    className="flex h-11 flex-1 items-center justify-center gap-[3px] px-2"
    aria-hidden="true"
  >
    {levels.map((level, i) => (
      <span
        key={i}
        className="w-[3px] rounded-full"
        style={{
          height: `${Math.max(8, Math.round(level * 36))}px`,
          background: active ? 'var(--accent-green)' : 'var(--primary-blue)',
          opacity: active ? 0.95 : 0.35,
          transition: 'height 80ms linear',
        }}
      />
    ))}
  </div>
);

export default VoiceWaveform;
