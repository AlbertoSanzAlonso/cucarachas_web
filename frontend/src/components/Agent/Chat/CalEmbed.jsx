import React, { useEffect } from 'react';

const CalEmbed = ({ eventLink = "cecsabarcelona/277401" }) => {
  useEffect(() => {
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

    window.Cal("init", "inspeccio", { origin: "https://app.cal.eu" });

    window.Cal.ns.inspeccio("inline", {
      elementOrSelector: "#cal-embed",
      config: { layout: 'month_view' },
      calLink: eventLink,
    });

    window.Cal.ns.inspeccio("ui", {
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
