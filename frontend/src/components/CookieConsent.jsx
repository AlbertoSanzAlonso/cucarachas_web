import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'cecsa_cookie_consent';

function readConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Banner RGPD: solo cookies técnicas / preferencia de consentimiento.
 * Estilo Sanitary Premium Clean (tokens CSS + inline como FloatingCTA).
 * z-index por encima del AgentHeroModal (z-200) y del FloatingCTA (z-100).
 */
const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !readConsent());

  const dismiss = (value) => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:bottom-8 md:max-w-lg z-[300] pointer-events-auto [@media(max-height:600px)_and_(orientation:landscape)]:bottom-2"
          style={{
            background: 'var(--primary-blue)',
            color: '#fff',
            borderRadius: '1.75rem',
            boxShadow: '0 20px 50px -12px rgba(0, 80, 120, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div className="p-5 md:p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div
                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.12)' }}
                aria-hidden
              >
                <Cookie size={20} style={{ color: 'var(--accent-green)' }} />
              </div>
              <div className="min-w-0 space-y-1.5">
                <h2
                  id="cookie-consent-title"
                  className="text-sm md:text-base font-black uppercase tracking-tight"
                >
                  {t('cookies.title')}
                </h2>
                <p
                  id="cookie-consent-desc"
                  className="text-xs md:text-sm leading-relaxed font-medium"
                  style={{ color: 'rgba(255, 255, 255, 0.78)' }}
                >
                  {t('cookies.description')}{' '}
                  <Link
                    to="/privacitat"
                    className="underline underline-offset-2 hover:opacity-90 font-bold"
                    style={{ color: 'var(--accent-green)' }}
                  >
                    {t('cookies.privacy_link')}
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => dismiss('necessary')}
                className="flex-1 order-2 sm:order-1 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:translate-y-[-1px] active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {t('cookies.reject')}
              </button>
              <button
                type="button"
                onClick={() => dismiss('accepted')}
                className="flex-1 order-1 sm:order-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 hover:translate-y-[-1px] active:scale-[0.98]"
                style={{
                  background: 'var(--accent-green)',
                  color: 'var(--secondary-gray)',
                  boxShadow: '0 4px 15px rgba(52, 211, 153, 0.35)',
                }}
              >
                {t('cookies.accept')}
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
