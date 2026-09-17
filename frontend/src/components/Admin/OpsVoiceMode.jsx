import React, { useEffect, useRef, useState } from 'react';
import { Loader2, PhoneOff, Mic } from 'lucide-react';
import createOpsRealtimeController from '@/hooks/useOpsRealtime';
import VoiceWaveform from '@/components/Admin/VoiceWaveform';

const STATUS_LABEL = {
  idle: 'Llest',
  connecting: 'Connectant…',
  listening: 'Escoltant…',
  thinking: 'Pensant…',
  speaking: 'Parlant…',
  tool: 'Consultant dades…',
  error: 'Error de connexió',
};

/**
 * Overlay de veu contínua (estil ChatGPT Advanced Voice).
 */
const OpsVoiceMode = ({
  open,
  conversationId,
  language = 'ca',
  createSession,
  runTool,
  saveTranscript,
  onClose,
  onConversationId,
}) => {
  const [status, setStatus] = useState('idle');
  const [captionRole, setCaptionRole] = useState('assistant');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState(null);
  const [levels, setLevels] = useState(() => Array.from({ length: 24 }, () => 0.12));
  const ctrlRef = useRef(null);
  const rafRef = useRef(0);
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (!open) return undefined;
    const pump = () => {
      const s = statusRef.current;
      const active = s === 'listening' || s === 'speaking' || s === 'tool';
      const base = active ? 0.25 : 0.1;
      const amp = s === 'speaking' ? 0.55 : s === 'listening' ? 0.35 : 0.15;
      setLevels(
        Array.from({ length: 24 }, (_, i) => {
          const t = Date.now() / 180 + i * 0.4;
          return Math.min(1, base + (active ? (Math.sin(t) * 0.5 + 0.5) * amp : 0));
        }),
      );
      rafRef.current = requestAnimationFrame(pump);
    };
    rafRef.current = requestAnimationFrame(pump);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const ctrl = createOpsRealtimeController({
      createSession,
      runTool,
      saveTranscript,
      onStatus: (s) => {
        if (!cancelled) setStatus(s);
      },
      onCaption: (role, text) => {
        if (cancelled) return;
        setCaptionRole(role);
        setCaption(text || '');
      },
      onError: (msg) => {
        if (!cancelled) {
          setError(msg);
          setStatus('error');
        }
      },
    });
    ctrlRef.current = ctrl;

    (async () => {
      try {
        setError(null);
        setCaption('');
        setStatus('connecting');
        const cid = await ctrl.start({ conversationId, language });
        if (cancelled) {
          ctrl.stop();
          return;
        }
        if (cid) onConversationId?.(cid);
      } catch (err) {
        if (!cancelled) {
          setError(err?.data?.detail || err?.message || 'No s’ha pogut iniciar la veu');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      ctrl.stop();
      ctrlRef.current = null;
    };
    // Solo al abrir/cerrar overlay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const pulse =
    status === 'speaking' || status === 'listening' || status === 'tool' || status === 'thinking';

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(ellipse at 50% 30%, rgba(0,128,187,0.55) 0%, rgba(15,23,42,0.96) 55%, #020617 100%)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Mode veu"
    >
      <p className="mb-8 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
        CECSA · Mode veu
      </p>

      <div
        className={`relative mb-10 flex h-40 w-40 items-center justify-center rounded-full ${
          pulse ? 'animate-pulse' : ''
        }`}
        style={{
          background:
            status === 'speaking'
              ? 'radial-gradient(circle, #34d399 0%, #0080bb 70%)'
              : 'radial-gradient(circle, rgba(0,128,187,0.9) 0%, rgba(15,23,42,0.4) 75%)',
          boxShadow: pulse
            ? '0 0 60px rgba(52,211,153,0.35), 0 0 120px rgba(0,128,187,0.25)'
            : '0 0 40px rgba(0,128,187,0.2)',
        }}
      >
        <Mic size={40} className="text-white" />
      </div>

      <div className="mb-6 w-full max-w-md">
        <VoiceWaveform levels={levels} active={status === 'listening' || status === 'speaking'} />
      </div>

      <p className="mb-3 text-sm font-medium text-white/80">
        {STATUS_LABEL[status] || status}
        {(status === 'connecting' || status === 'thinking' || status === 'tool') && (
          <Loader2 size={14} className="ml-2 inline animate-spin" />
        )}
      </p>

      <p
        className={`mb-12 min-h-[3.5rem] max-w-xl text-center text-lg leading-snug ${
          captionRole === 'user' ? 'text-white/70' : 'text-white'
        }`}
      >
        {error || caption || 'Parla amb naturalitat. Digues «sí» per confirmar enviaments.'}
      </p>

      <button
        type="button"
        onClick={() => {
          ctrlRef.current?.stop();
          onClose?.();
        }}
        className="flex items-center gap-2 rounded-full bg-red-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-600"
      >
        <PhoneOff size={18} />
        Penjar
      </button>
    </div>
  );
};

export default OpsVoiceMode;
