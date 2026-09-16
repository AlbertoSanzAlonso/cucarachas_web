import { useCallback, useEffect, useRef, useState } from 'react';

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export default function useVoiceRecorder({ barCount = 28 } = {}) {
  const [supported] = useState(
    () => typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined',
  );
  const [recording, setRecording] = useState(false);
  const [levels, setLevels] = useState(() => Array.from({ length: barCount }, () => 0.12));
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(0);
  const stopResolveRef = useRef(null);

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    try {
      recRef.current?.state === 'recording' && recRef.current.stop();
    } catch {
      /* ignore */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      ctxRef.current?.close();
    } catch {
      /* ignore */
    }
    ctxRef.current = null;
    analyserRef.current = null;
    recRef.current = null;
    setRecording(false);
    setLevels(Array.from({ length: barCount }, () => 0.12));
  }, [barCount]);

  useEffect(() => () => teardown(), [teardown]);

  const pumpLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    const bars = [];
    const slice = Math.floor(data.length / barCount) || 1;
    for (let i = 0; i < barCount; i += 1) {
      let peak = 0;
      const start = i * slice;
      for (let j = start; j < start + slice && j < data.length; j += 1) {
        peak = Math.max(peak, Math.abs(data[j] - 128));
      }
      bars.push(Math.min(1, 0.12 + peak / 48));
    }
    setLevels(bars);
    rafRef.current = requestAnimationFrame(pumpLevels);
  }, [barCount]);

  const start = useCallback(async () => {
    if (!supported || recording) return false;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyserRef.current = analyser;
    pumpLevels();

    chunksRef.current = [];
    const mime = pickMimeType();
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    recRef.current = rec;
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size) chunksRef.current.push(ev.data);
    };
    rec.onstop = () => {
      const type = rec.mimeType || mime || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type });
      const resolve = stopResolveRef.current;
      stopResolveRef.current = null;
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      cancelAnimationFrame(rafRef.current);
      resolve?.(blob);
    };
    rec.start(80);
    setRecording(true);
    return true;
  }, [pumpLevels, recording, supported]);

  const stop = useCallback(() => {
    if (!recording || !recRef.current) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      try {
        if (recRef.current.state === 'recording') recRef.current.stop();
        else resolve(null);
      } catch {
        resolve(null);
      }
      setRecording(false);
    });
  }, [recording]);

  return { supported, recording, levels, start, stop, teardown };
}
