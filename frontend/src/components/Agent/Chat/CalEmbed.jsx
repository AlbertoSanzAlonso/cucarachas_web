import React, { useEffect } from 'react';

const CalEmbed = ({ eventLink = "cecsabarcelona/277401" }) => {
  useEffect(() => {
    // Cal.com embed script
    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.q) { cal.q = []; }
        p(cal, ar);
      };
    })(window, "https://app.cal.eu/embed/embed.js", "init");

    window.Cal("init", { origin: "https://cal.eu" });
    window.Cal("inline", {
      elementOrSelector: "#cal-embed",
      calLink: eventLink,
      layout: "month_view"
    });

    window.Cal("ui", {
      theme: "light",
      styles: {
        branding: { brandColor: "#0080bb" }
      },
      hideEventTypeDetails: false,
      layout: "month_view"
    });
  }, [eventLink]);

  return (
    <div 
      id="cal-embed" 
      className="w-full h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden bg-white shadow-inner"
    />
  );
};

export default CalEmbed;
