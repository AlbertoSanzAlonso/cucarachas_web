import React from 'react';

const CalEmbed = ({ eventLink = "cucarachasbarcelona/30min" }) => {
  // Construimos la URL para la instancia europea con los parámetros de embed
  const calUrl = `https://cal.eu/${eventLink}?embed=true&theme=light&layout=month_view`;

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden bg-white shadow-inner relative">
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
