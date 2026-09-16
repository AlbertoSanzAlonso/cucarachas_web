import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  BookmarkPlus,
  LayoutDashboard,
  Loader2,
  Mic,
  PanelRight,
  Plus,
  Search,
  Send,
  SquarePen,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from 'lucide-react';
import {
  useCreateOpsConversationMutation,
  useCreateOpsNoteMutation,
  useDeleteOpsConversationMutation,
  useDeleteOpsNoteMutation,
  useGetOpsConversationQuery,
  useGetOpsConversationsQuery,
  useGetOpsModelsQuery,
  useGetOpsNotesQuery,
  useSendOpsMessageMutation,
  useSendOpsVoiceMutation,
} from '@/store/apis/opsChatApi';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';
import VoiceWaveform from '@/components/Admin/VoiceWaveform';
import ConfirmModal from '@/components/Admin/ConfirmModal';

const SUGGESTIONS = [
  'Busca aquest client al CRM pel telèfon',
  'Busca al mirall iGEO el 612345678',
  'Crea un potencial a iGEO amb les dades que et passo',
  'Envia un WhatsApp a aquest mòbil amb el text que et passo',
  'Envia un email a aquest correu amb l’assumpte i el text que et passo',
  'Quines renovacions tenim a l’octubre?',
  'Prepara una ordre per demà a les 7:30',
];

const TTS_KEY = 'cecsa_ops_tts';
const MODEL_KEY = 'cecsa_ops_model';

function formatTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ca-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

const AdminOpsChat = ({ user, onOpenSidebar, isDark, toggleTheme }) => {
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [notesOpen, setNotesOpen] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    try {
      return window.localStorage.getItem(TTS_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [modelId, setModelId] = useState(() => {
    try {
      return window.localStorage.getItem(MODEL_KEY) || '';
    } catch {
      return '';
    }
  });
  const [noteDraft, setNoteDraft] = useState('');
  const [noteGlobal, setNoteGlobal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [deleteNoteError, setDeleteNoteError] = useState(null);
  /** Mensaje del usuario mostrado al instante mientras el API responde. */
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingActionConvId, setPendingActionConvId] = useState(null);
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [confirmActionError, setConfirmActionError] = useState(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const { data: modelCatalog } = useGetOpsModelsQuery();
  const { data: conversations = [], isLoading: listLoading } = useGetOpsConversationsQuery(
    search ? { q: search } : undefined,
  );
  const { data: thread, isFetching: threadLoading } = useGetOpsConversationQuery(activeId, {
    skip: !activeId,
  });
  const { data: globalNotes = [] } = useGetOpsNotesQuery({ scope: 'global' });
  const [createConv, { isLoading: creating }] = useCreateOpsConversationMutation();
  const [sendMessage, { isLoading: sending }] = useSendOpsMessageMutation();
  const [sendVoice, { isLoading: sendingVoice }] = useSendOpsVoiceMutation();
  const [deleteConv] = useDeleteOpsConversationMutation();
  const [createNote] = useCreateOpsNoteMutation();
  const [deleteNote] = useDeleteOpsNoteMutation();

  const messages = thread?.messages || [];
  const notes = thread?.notes || [];
  const busy = sending || sendingVoice || creating;
  const voice = useVoiceRecorder();

  const showPendingUser =
    Boolean(pendingUser) &&
    (pendingUser.source === 'voice'
      ? busy
      : !messages.some((m) => m.role === 'user' && m.content === pendingUser.content));

  const modelOptions = modelCatalog?.models || [];
  const allowedIds = modelOptions.map((m) => m.id);
  const selectedModel =
    modelId && (!allowedIds.length || allowedIds.includes(modelId))
      ? modelId
      : modelCatalog?.default || 'openai:gpt-4o-mini';

  const chooseModel = (id) => {
    setModelId(id);
    try {
      window.localStorage.setItem(MODEL_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const ensureConversation = async () => {
    if (activeId) return activeId;
    const created = await createConv({}).unwrap();
    setActiveId(created.id);
    return created.id;
  };

  const toggleTts = () => {
    setTtsEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(TTS_KEY, next ? 'true' : 'false');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const playAssistantAudio = (b64) => {
    if (!b64) return;
    const src = `data:audio/mpeg;base64,${b64}`;
    const audio = new Audio(src);
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length, busy, pendingUser]);

  // Quitar el optimista cuando el fil del servidor ya incluye la pregunta.
  useEffect(() => {
    if (!pendingUser) return;
    if (pendingUser.source === 'voice') {
      if (!busy) setPendingUser(null);
      return;
    }
    if (!messages.length) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser?.content === pendingUser.content) {
      setPendingUser(null);
    }
  }, [messages, pendingUser, busy]);

  const submit = async (raw) => {
    const text = (raw ?? draft).trim();
    if (!text || busy) return;
    setDraft('');
    setPendingUser({ content: text, source: 'text' });
    try {
      const convId = await ensureConversation();
      const result = await sendMessage({
        id: convId,
        content: text,
        language: 'ca',
        model: selectedModel,
      }).unwrap();
      if (result?.pending_action) {
        setConfirmActionError(null);
        setPendingAction(result.pending_action);
        setPendingActionConvId(result.conversation_id || convId);
      }
    } catch {
      setDraft(text);
      setPendingUser(null);
    }
  };

  const handleCloseActionConfirm = () => {
    if (isConfirmingAction) return;
    setPendingAction(null);
    setPendingActionConvId(null);
    setConfirmActionError(null);
  };

  const handleConfirmPendingAction = async () => {
    const convId = pendingActionConvId || activeId;
    if (!pendingAction || !convId) return;
    setIsConfirmingAction(true);
    setConfirmActionError(null);
    try {
      await sendMessage({
        id: convId,
        language: 'ca',
        model: selectedModel,
        confirm_action: pendingAction,
      }).unwrap();
      setPendingAction(null);
      setPendingActionConvId(null);
    } catch (err) {
      setConfirmActionError(
        err?.data?.detail || "No s'ha pogut executar l'acció. Torna-ho a provar.",
      );
    } finally {
      setIsConfirmingAction(false);
    }
  };

  const pendingActionTitle =
    pendingAction?.kind === 'whatsapp'
      ? 'Confirmar WhatsApp'
      : pendingAction?.kind === 'email'
        ? 'Confirmar correu'
        : pendingAction?.kind === 'igeo_lead'
          ? 'Confirmar lead iGEO'
          : 'Confirmar acció';

  const pendingActionConfirmLabel =
    pendingAction?.kind === 'whatsapp'
      ? 'Sí, enviar WhatsApp'
      : pendingAction?.kind === 'email'
        ? 'Sí, enviar correu'
        : pendingAction?.kind === 'igeo_lead'
          ? 'Sí, crear lead'
          : 'Sí, confirmar';

  const toggleVoice = async () => {
    if (busy) return;
    if (voice.recording) {
      const blob = await voice.stop();
      if (!blob || blob.size < 800) return;
      setPendingUser({ content: 'Missatge de veu…', source: 'voice' });
      try {
        const convId = await ensureConversation();
        const file = new File([blob], 'nota.webm', { type: blob.type || 'audio/webm' });
        const result = await sendVoice({
          id: convId,
          audio: file,
          language: 'ca',
          speak: ttsEnabled,
          model: selectedModel,
        }).unwrap();
        if (result?.pending_action) {
          setConfirmActionError(null);
          setPendingAction(result.pending_action);
          setPendingActionConvId(result.conversation_id || convId);
        }
        if (ttsEnabled) playAssistantAudio(result?.assistant_audio_base64);
      } catch {
        setPendingUser(null);
      }
      return;
    }
    if (!voice.supported) {
      window.alert('El navegador no permet gravar àudio. Prova Chrome o Edge amb HTTPS.');
      return;
    }
    try {
      await voice.start();
    } catch {
      window.alert('Cal permís de micròfon per parlar amb l’assistent.');
    }
  };

  const handleNewChat = () => {
    setActiveId(null);
    setDraft('');
    setPendingUser(null);
    inputRef.current?.focus();
  };

  const handleDeleteThread = (id, event) => {
    event?.stopPropagation();
    setDeleteError(null);
    setDeleteTargetId(id);
  };

  const handleCloseDeleteConfirm = () => {
    if (isDeleting) return;
    setDeleteTargetId(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteConv(deleteTargetId).unwrap();
      if (activeId === deleteTargetId) setActiveId(null);
      setDeleteTargetId(null);
    } catch (err) {
      setDeleteError(
        err?.data?.detail || "No s'ha pogut eliminar la conversa. Torna-ho a provar.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteNote = (note) => {
    setDeleteNoteError(null);
    setDeleteNoteTarget(note);
  };

  const handleCloseDeleteNoteConfirm = () => {
    if (isDeletingNote) return;
    setDeleteNoteTarget(null);
    setDeleteNoteError(null);
  };

  const handleConfirmDeleteNote = async () => {
    if (!deleteNoteTarget?.id) return;
    setIsDeletingNote(true);
    setDeleteNoteError(null);
    try {
      await deleteNote({
        id: deleteNoteTarget.id,
        conversation: deleteNoteTarget.conversation ?? null,
      }).unwrap();
      setDeleteNoteTarget(null);
    } catch (err) {
      setDeleteNoteError(
        err?.data?.detail || "No s'ha pogut eliminar la nota. Torna-ho a provar.",
      );
    } finally {
      setIsDeletingNote(false);
    }
  };

  const saveNoteFromMessage = async (content) => {
    if (!activeId || !content) return;
    const title = content.trim().split('\n')[0].slice(0, 80);
    await createNote({
      conversation: activeId,
      title: title || 'Nota',
      content: content.trim(),
      pinned: true,
    });
  };

  const saveManualNote = async () => {
    const content = noteDraft.trim();
    if (!content) return;
    const asGlobal = noteGlobal || !activeId;
    await createNote({
      conversation: asGlobal ? null : activeId,
      title: content.split('\n')[0].slice(0, 80),
      content,
      pinned: true,
    });
    setNoteDraft('');
    setNoteGlobal(false);
  };

  const handleNoteKeyDown = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    void saveManualNote();
  };

  const composer = (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 md:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!voice.recording) submit();
        }}
        className="flex items-end gap-2 rounded-3xl border border-admin-border bg-admin-card p-2 shadow-lg shadow-primary-blue/5"
      >
        {voice.recording ? (
          <VoiceWaveform levels={voice.levels} active />
        ) : (
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Escriu, o prem el micròfon i parla — s’envia sol"
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-admin-text outline-none"
            data-lenis-prevent
          />
        )}
        <button
          type="button"
          onClick={toggleVoice}
          disabled={busy}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
            voice.recording
              ? 'bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.25)]'
              : 'bg-admin-muted text-admin-text hover:bg-primary-blue/10 hover:text-primary-blue'
          }`}
          title={voice.recording ? 'Atura i envia' : 'Parlar amb l’assistent'}
          aria-label={voice.recording ? 'Atura i envia' : 'Micròfon'}
        >
          <Mic size={18} />
        </button>
        <button
          type="submit"
          disabled={busy || voice.recording || !draft.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-green)] text-white disabled:opacity-40"
          aria-label="Enviar"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-admin-text-muted">
        {voice.recording
          ? 'Gravant… torna a prémer el micròfon per enviar-ho a l’assistent'
          : 'Assistent intern · la veu s’envia directament, sense passar pel recuadre'}
      </p>
    </div>
  );

  const empty = !activeId && !pendingUser;

  return (
    <div className="flex h-full min-h-0 bg-admin-page" data-lenis-prevent>
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-admin-border bg-admin-card md:flex">
        <div className="flex items-center justify-between gap-2 p-4">
          <span className="text-xs font-black uppercase tracking-widest text-admin-text-muted">
            Oficina
          </span>
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1 rounded-xl bg-[var(--primary-blue)] px-3 py-1.5 text-xs font-bold text-white"
          >
            <Plus size={14} /> Nova
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-xl border border-admin-border bg-admin-muted px-3 py-2">
            <Search size={14} className="text-admin-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca converses"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {listLoading ? (
            <p className="px-3 py-6 text-sm text-admin-text-muted">Carregant…</p>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-6 text-sm text-admin-text-muted">Encara no hi ha historial.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`group mb-1 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activeId === c.id ? 'bg-[var(--primary-blue)]/10' : 'hover:bg-admin-muted'
                }`}
              >
                <SquarePen size={14} className="mt-1 shrink-0 text-admin-text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-admin-text">
                    {c.title || 'Nova conversa'}
                  </span>
                  <span className="block truncate text-[11px] text-admin-text-muted">
                    {c.preview || formatTime(c.updated_at)}
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleDeleteThread(c.id, e)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteThread(c.id, e)}
                  className="hidden rounded-lg p-1 text-admin-text-muted hover:bg-red-50 hover:text-red-500 group-hover:block"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-admin-border bg-admin-card px-3 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="rounded-xl border border-admin-border bg-admin-card p-2 text-primary-blue lg:hidden"
              aria-label="Menú"
            >
              <LayoutDashboard size={20} />
            </button>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-admin-text md:text-base">
                {thread?.title || 'Assistent d’oficina'}
              </h2>
              <p className="text-[11px] text-admin-text-muted">
                {user?.email || 'Admin'} · independent del xat de la web
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl p-2 text-admin-text-muted hover:bg-admin-muted hover:text-primary-blue"
              aria-label={isDark ? 'Canviar a mode dia' : 'Canviar a mode nit'}
              title={isDark ? 'Mode dia' : 'Mode nit'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <label className="min-w-0">
              <span className="sr-only">Model</span>
              <select
                value={selectedModel}
                onChange={(e) => chooseModel(e.target.value)}
                className="max-w-[11rem] rounded-xl border border-admin-border bg-admin-card px-2 py-2 text-xs font-semibold text-admin-text outline-none sm:max-w-[16rem]"
                title="Model de l’assistent"
              >
                {modelOptions.length === 0 ? (
                  <option value={selectedModel}>{selectedModel}</option>
                ) : (
                  modelOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))
                )}
              </select>
            </label>
            <button
              type="button"
              onClick={handleNewChat}
              className="rounded-xl border border-admin-border px-3 py-2 text-xs font-bold text-admin-text md:hidden"
            >
              Nova
            </button>
            <button
              type="button"
              onClick={toggleTts}
              className={`rounded-xl p-2 ${ttsEnabled ? 'bg-[var(--primary-blue)] text-white' : 'text-admin-text-muted hover:bg-admin-muted'}`}
              title={ttsEnabled ? 'Resposta en veu activada' : 'Resposta en veu desactivada'}
              aria-pressed={ttsEnabled}
            >
              {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className={`rounded-xl p-2 ${notesOpen ? 'bg-[var(--primary-blue)] text-white' : 'text-admin-text-muted hover:bg-admin-muted'}`}
              title="Notes importants"
            >
              <PanelRight size={18} />
            </button>
          </div>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-admin-border bg-admin-card px-3 py-2 md:hidden">
          {conversations.slice(0, 12).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                activeId === c.id ? 'bg-[var(--primary-blue)] text-white' : 'bg-admin-muted text-admin-text'
              }`}
            >
              {(c.title || 'Nova').slice(0, 22)}
            </button>
          ))}
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
          {empty ? (
            <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-blue)] text-white">
                <SquarePen size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-admin-text">
                En què treballam avui?
              </h3>
              <p className="mt-2 max-w-md text-sm text-admin-text-muted">
                Cerca clients, prepara potencials iGEO, notes de renovació o ordres. Tot queda desat en aquest historial.
              </p>
              <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-2xl border border-admin-border bg-admin-card px-4 py-3 text-left text-sm text-admin-text-muted hover:border-[var(--primary-blue)]/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4 px-3 py-6 md:px-6">
              {threadLoading && messages.length === 0 ? (
                <p className="text-sm text-admin-text-muted">Carregant fil…</p>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[var(--primary-blue)] text-white'
                        : 'bg-admin-card text-admin-text shadow-sm border border-admin-border'
                    }`}
                  >
                    {m.content}
                    {m.source === 'voice' ? (
                      <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                        <Mic size={12} /> Veu
                      </span>
                    ) : null}
                    {m.role === 'assistant' ? (
                      <button
                        type="button"
                        onClick={() => saveNoteFromMessage(m.content)}
                        className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-blue/70 hover:text-primary-blue"
                      >
                        <BookmarkPlus size={12} /> Desa com a nota
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {showPendingUser ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-[var(--primary-blue)] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-white opacity-90">
                    {pendingUser.content}
                    {pendingUser.source === 'voice' ? (
                      <span className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                        <Mic size={12} /> Veu
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {busy ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-admin-border bg-admin-card px-4 py-3 text-sm text-admin-text-muted">
                    {sendingVoice ? 'Processant la veu…' : 'Pensant…'}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {composer}
      </section>

      {notesOpen ? (
        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-admin-border bg-admin-card lg:flex">
          <div className="flex items-center justify-between border-b border-admin-border px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-admin-text-muted">
              <Bookmark size={14} /> Notes
            </span>
            <button type="button" onClick={() => setNotesOpen(false)} className="p-1 text-admin-text-muted">
              <X size={16} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-3">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
                Instruccions globals (RAG)
              </p>
              {globalNotes.length === 0 ? (
                <p className="text-sm text-admin-text-muted">
                  Cap instrucció global. Marca «Global / RAG» en desar.
                </p>
              ) : (
                globalNotes.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-[var(--primary-blue)]/20 bg-[var(--primary-blue)]/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-admin-text">{n.title}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n)}
                        className="text-admin-text-muted hover:text-red-500"
                        aria-label="Esborrar nota global"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-admin-text-muted">{n.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 border-t border-admin-border pt-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-admin-text-muted">
                Notes d’aquest fil
              </p>
              {!activeId ? (
                <p className="text-sm text-admin-text-muted">
                  Obre una conversa per veure notes del fil.
                </p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-admin-text-muted">Cap nota encara. Desa un missatge o n’afegeix una.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-admin-border bg-admin-muted p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-admin-text">{n.title}</p>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n)}
                        className="text-admin-text-muted hover:text-red-500"
                        aria-label="Esborrar nota"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-admin-text-muted">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="border-t border-admin-border p-3">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={handleNoteKeyDown}
              rows={3}
              placeholder="Afegir nota o instrucció… (Enter per desar)"
              className="w-full resize-none rounded-xl border border-admin-border p-2 text-sm outline-none focus:border-[var(--primary-blue)]"
            />
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-admin-text-muted">
              <input
                type="checkbox"
                checked={noteGlobal || !activeId}
                onChange={(e) => setNoteGlobal(e.target.checked)}
                disabled={!activeId}
                className="rounded border-admin-border"
              />
              Global / RAG (tots els chats)
            </label>
            <button
              type="button"
              onClick={saveManualNote}
              disabled={!noteDraft.trim()}
              className="mt-2 w-full rounded-xl bg-[var(--primary-blue)] py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Desar {noteGlobal || !activeId ? 'instrucció global' : 'nota del fil'}
            </button>
          </div>
        </aside>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Eliminar conversa"
        message="Estàs segur que vols eliminar aquesta conversa i les seves notes? Aquesta acció no es pot desfer."
        confirmLabel="Sí, eliminar"
        cancelLabel="No, tornar"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
      />

      <ConfirmModal
        isOpen={Boolean(deleteNoteTarget)}
        onClose={handleCloseDeleteNoteConfirm}
        onConfirm={handleConfirmDeleteNote}
        title="Eliminar nota"
        message={`Estàs segur que vols eliminar «${deleteNoteTarget?.title || 'aquesta nota'}»? Aquesta acció no es pot desfer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="No, tornar"
        variant="danger"
        isLoading={isDeletingNote}
        error={deleteNoteError}
      />

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        onClose={handleCloseActionConfirm}
        onConfirm={handleConfirmPendingAction}
        title={pendingActionTitle}
        message={pendingAction?.summary || 'Confirmes aquesta acció?'}
        confirmLabel={pendingActionConfirmLabel}
        cancelLabel="Cancel·lar"
        variant="primary"
        isLoading={isConfirmingAction}
        error={confirmActionError}
      />
    </div>
  );
};

export default AdminOpsChat;
