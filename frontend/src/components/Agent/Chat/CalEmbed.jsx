import React from 'react';

const CalEmbed = ({ eventLink = "cucarachasbarcelona/30min", language = "ca" }) => {
  // Añadimos hideEventTypeDetails=true y el idioma seleccionado
  const calUrl = `https://cal.eu/${eventLink}?embed=true&theme=light&hideEventTypeDetails=true&language=${language}`;

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
