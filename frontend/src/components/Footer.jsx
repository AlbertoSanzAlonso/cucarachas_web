import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const navLinks = [
    { title: 'Inicio', href: '#' },
    { title: 'Servicios', href: '#servicios' },
    { title: 'Sobre Nosotros', href: '#nosotros' },
    { title: 'Contacto', href: '#contacto' },
  ];

  const services = [
    'Desinsectación',
    'Desratización',
    'Desinfección',
    'Control de Plagas HORECA',
  ];

  const socialLinks = [
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer
      style={{
        background: '#0080bb',
        color: 'rgba(255,255,255,0.85)',
        padding: '72px 0 0',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .footer-grid { justify-items: center; }
          .footer-col { align-items: center !important; text-align: center; width: 100%; }
          .footer-col ul { align-items: center; }
          .footer-col a[href^="#"] { justify-content: center; }
          .footer-social { justify-content: center !important; }
          .footer-badge { align-items: center; text-align: center; }
          .footer-contact-row { justify-content: center; }
        }
      `}</style>
      <div className="container">
        {/* Main grid */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '64px',
          }}
        >
          {/* Brand col */}
          <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Logo */}
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
              <img
                src="/assets/isotipo.png"
                alt="CECSA"
                style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>CECSA</span>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', color: '#34d399', textTransform: 'uppercase', lineHeight: 1 }}>Urban Plagas</span>
              </div>
            </a>

            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: '280px' }}>
              Líderes en sanidad ambiental en Barcelona. Restauramos el equilibrio de su entorno con rigor científico y compromiso ético.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'background 200ms, transform 150ms',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="footer-col">
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white', marginBottom: '24px' }}>
              Navegación
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {navLinks.map(link => (
                <li key={link.title}>
                  <a
                    href={link.href}
                    style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 200ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white', marginBottom: '24px' }}>
              Servicios
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {services.map(service => (
                <li key={service}>
                  <a
                    href="#servicios"
                    style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 200ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & badge */}
          <div className="footer-col">
            <h4 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white', marginBottom: '24px' }}>
              Legal y Sanidad
            </h4>
            <div
              style={{
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: '#34d399', flexShrink: 0 }} />
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white', lineHeight: 1.4 }}>
                  Acreditación Sanitaria<br />ROESB: 0246-CAT-SB
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
                Empresa autorizada por el Departament de Salut de la Generalitat de Catalunya.
              </p>
            </div>

            {/* Contact mini */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href="tel:933309169" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                <Phone size={14} style={{ color: '#34d399' }} /> 933 309 169
              </a>
              <a href="mailto:info@cecsa.es" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                <Mail size={14} style={{ color: '#34d399' }} /> info@cecsa.es
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600 }}>
                <MapPin size={14} style={{ color: '#34d399' }} /> Barcelona, Área Metropolitana
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — dark strip — OUTSIDE container for full width */}
      </div>

      <div
        style={{
          background: 'rgba(0,0,0,0.28)',
          padding: '18px 0',
          marginTop: '0',
        }}
      >
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            © {new Date().getFullYear()} CECSA Urban Plagas. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: '28px' }}>
            {['Aviso Legal', 'Política de Privacidad', 'Cookies'].map(item => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  transition: 'color 200ms',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
