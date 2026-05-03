import React from 'react';

const CalEmbed = ({ eventLink = "cucarachasbarcelona/30min" }) => {
  // Añadimos hideEventTypeDetails=true para que sea más compacto
  const calUrl = `https://cal.eu/${eventLink}?embed=true&theme=light&hideEventTypeDetails=true`;

  return (
    <div className="w-full h-full bg-white relative">
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
