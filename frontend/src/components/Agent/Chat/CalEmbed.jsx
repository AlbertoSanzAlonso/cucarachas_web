import React from 'react';

const CalEmbed = ({ eventLink = "cucarachasbarcelona/30min" }) => {
  // Añadimos hideEventTypeDetails=true para que sea más compacto
  const calUrl = `https://cal.eu/${eventLink}?embed=true&theme=light&layout=month_view&hideEventTypeDetails=true`;

  return (
    <div className="w-full h-[450px] md:h-[500px] rounded-[1.5rem] overflow-hidden bg-white shadow-xl border border-white/20 relative animate-in fade-in zoom-in duration-500">
      <iframe
        src={calUrl}
        title="Reserva de cita CECSA"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        className="absolute inset-0"
      />
    </div>
  );
};

export default CalEmbed;
