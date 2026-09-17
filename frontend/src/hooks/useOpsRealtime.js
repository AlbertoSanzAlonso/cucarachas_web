/**
 * Sesión OpenAI Realtime (WebRTC) para el asistente de oficina.
 * Habla continua tipo ChatGPT; tools vía Django.
 */

const REALTIME_CALLS_URL = 'https://api.openai.com/v1/realtime/calls';

function parseJsonSafe(raw) {
  if (raw == null) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function createOpsRealtimeController({
  createSession,
  runTool,
  saveTranscript,
  onStatus,
  onCaption,
  onError,
} = {}) {
  let pc = null;
  let dc = null;
  let audioEl = null;
  let localStream = null;
  let conversationId = null;
  let active = false;
  let assistantBuf = '';
  let handledCallIds = new Set();
  let sessionConfigured = false;

  const setStatus = (s) => onStatus?.(s);
  const setCaption = (role, text) => onCaption?.(role, text);
  const fail = (err) => {
    const msg = err?.message || String(err || 'Error de veu');
    onError?.(msg);
    setStatus('error');
  };

  const sendEvent = (payload) => {
    if (!dc || dc.readyState !== 'open') return;
    const event = { ...payload };
    if (!event.event_id) {
      event.event_id = crypto.randomUUID();
    }
    dc.send(JSON.stringify(event));
  };

  const persist = async (role, content) => {
    const text = (content || '').trim();
    if (!text || !conversationId || !saveTranscript) return;
    try {
      await saveTranscript({ conversation_id: conversationId, role, content: text });
    } catch {
      /* ignore persist errors during live session */
    }
  };

  const handleFunctionCall = async (item) => {
    const callId = item?.call_id;
    const name = item?.name;
    if (!callId || !name || handledCallIds.has(callId)) return;
    handledCallIds.add(callId);
    setStatus('tool');
    let output = 'Error desconegut';
    try {
      const res = await runTool({
        conversation_id: conversationId,
        name,
        arguments: parseJsonSafe(item.arguments),
      });
      output = res?.output ?? String(res ?? '');
    } catch (err) {
      output = `Error tool ${name}: ${err?.data?.detail || err?.message || err}`;
    }
    sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: typeof output === 'string' ? output : JSON.stringify(output),
      },
    });
    sendEvent({ type: 'response.create' });
    setStatus('listening');
  };

  const onServerEvent = async (event) => {
    const type = event?.type || '';

    if (type === 'session.created' && !sessionConfigured) {
      sessionConfigured = true;
      setStatus('listening');
    }

    if (type === 'input_audio_buffer.speech_started') {
      assistantBuf = '';
      setStatus('listening');
      setCaption('user', '…');
    }

    if (type === 'input_audio_buffer.speech_stopped') {
      setStatus('thinking');
    }

    if (
      type === 'conversation.item.input_audio_transcription.completed' ||
      type === 'conversation.item.input_audio_transcription.done'
    ) {
      const text = (event.transcript || event.item?.content?.[0]?.transcript || '').trim();
      if (text) {
        setCaption('user', text);
        void persist('user', text);
      }
    }

    if (
      type === 'response.output_audio_transcript.delta' ||
      type === 'response.audio_transcript.delta'
    ) {
      assistantBuf += event.delta || '';
      setCaption('assistant', assistantBuf);
      setStatus('speaking');
    }

    if (
      type === 'response.output_audio_transcript.done' ||
      type === 'response.audio_transcript.done'
    ) {
      const text = (event.transcript || assistantBuf || '').trim();
      if (text) {
        setCaption('assistant', text);
        void persist('assistant', text);
      }
      assistantBuf = '';
    }

    if (type === 'response.done' && Array.isArray(event.response?.output)) {
      for (const item of event.response.output) {
        if (item?.type === 'function_call') {
          await handleFunctionCall(item);
        }
      }
      if (!event.response.output.some((i) => i?.type === 'function_call')) {
        setStatus('listening');
      }
    }

    if (type === 'error') {
      fail(event.error?.message || event.message || 'Error Realtime');
    }
  };

  const stop = () => {
    active = false;
    try {
      dc?.close();
    } catch {
      /* ignore */
    }
    dc = null;
    try {
      pc?.getSenders()?.forEach((sender) => {
        try {
          sender.track?.stop();
        } catch {
          /* ignore */
        }
      });
      pc?.close();
    } catch {
      /* ignore */
    }
    pc = null;
    localStream?.getTracks()?.forEach((t) => t.stop());
    localStream = null;
    if (audioEl) {
      try {
        audioEl.srcObject = null;
        audioEl.remove();
      } catch {
        /* ignore */
      }
    }
    audioEl = null;
    handledCallIds = new Set();
    sessionConfigured = false;
    assistantBuf = '';
    setStatus('idle');
  };

  const start = async ({ conversationId: existingId, language = 'ca' } = {}) => {
    if (active) return conversationId;
    setStatus('connecting');
    handledCallIds = new Set();
    sessionConfigured = false;
    assistantBuf = '';

    const session = await createSession({
      conversation_id: existingId || undefined,
      language,
    });
    conversationId = session.conversation_id;
    const ephemeralKey = session.client_secret;
    if (!ephemeralKey) {
      throw new Error('Sense clau efímera Realtime');
    }

    const peer = new RTCPeerConnection();
    pc = peer;

    audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.setAttribute('playsinline', 'true');
    peer.ontrack = (e) => {
      audioEl.srcObject = e.streams[0];
      audioEl.play?.().catch(() => {});
    };

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

    const channel = peer.createDataChannel('oai-events');
    dc = channel;
    channel.addEventListener('open', () => {
      active = true;
      setStatus('listening');
    });
    channel.addEventListener('message', (e) => {
      try {
        const event = JSON.parse(e.data);
        void onServerEvent(event);
      } catch {
        /* ignore bad frames */
      }
    });
    channel.addEventListener('close', () => {
      if (active) stop();
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const model = session.model || 'gpt-realtime';
    const sdpResponse = await fetch(`${REALTIME_CALLS_URL}?model=${encodeURIComponent(model)}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });
    if (!sdpResponse.ok) {
      const errText = await sdpResponse.text();
      stop();
      throw new Error(`WebRTC Realtime HTTP ${sdpResponse.status}: ${errText.slice(0, 200)}`);
    }
    const answerSdp = await sdpResponse.text();
    await peer.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    return conversationId;
  };

  return {
    start,
    stop,
    get conversationId() {
      return conversationId;
    },
    get active() {
      return active;
    },
  };
}
