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
} from 'lucide-react';
import {
  useCreateOpsConversationMutation,
  useCreateOpsNoteMutation,
  useDeleteOpsConversationMutation,
  useDeleteOpsNoteMutation,
  useGetOpsConversationQuery,
  useGetOpsConversationsQuery,
  useSendOpsMessageMutation,
  useSendOpsVoiceMutation,
} from '@/store/apis/opsChatApi';
import useVoiceRecorder from '@/hooks/useVoiceRecorder';
import VoiceWaveform from '@/components/Admin/VoiceWaveform';

const SUGGESTIONS = [
  'Busca aquest client al CRM pel telèfon',
  'Crea un potencial a iGEO amb les dades que et passo',
  'Quines renovacions tenim a l’octubre?',
  'Prepara una ordre per demà a les 7:30',
];

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

const AdminOpsChat = ({ user, onOpenSidebar }) => {
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [notesOpen, setNotesOpen] = useState(true);
  const [noteDraft, setNoteDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const { data: conversations = [], isLoading: listLoading } = useGetOpsConversationsQuery(
    search ? { q: search } : undefined,
  );
  const { data: thread, isFetching: threadLoading } = useGetOpsConversationQuery(activeId, {
    skip: !activeId,
  });
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

  const ensureConversation = async () => {
    if (activeId) return activeId;
    const created = await createConv({}).unwrap();
    setActiveId(created.id);
    return created.id;
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
  }, [messages.length, busy]);

  const submit = async (raw) => {
    const text = (raw ?? draft).trim();
    if (!text || busy) return;
    setDraft('');
    const convId = await ensureConversation();
    await sendMessage({ id: convId, content: text, language: 'ca' }).unwrap();
  };

  const toggleVoice = async () => {
    if (busy) return;
    if (voice.recording) {
      const blob = await voice.stop();
      if (!blob || blob.size < 800) return;
      const convId = await ensureConversation();
      const file = new File([blob], 'nota.webm', { type: blob.type || 'audio/webm' });
      const result = await sendVoice({ id: convId, audio: file, language: 'ca' }).unwrap();
      playAssistantAudio(result?.assistant_audio_base64);
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
    inputRef.current?.focus();
  };

  const handleDeleteThread = async (id, event) => {
    event?.stopPropagation();
    if (!window.confirm('Eliminar aquesta conversa i les seves notes?')) return;
    await deleteConv(id);
    if (activeId === id) setActiveId(null);
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
    await createNote({
      conversation: activeId || null,
      title: content.split('\n')[0].slice(0, 80),
      content,
      pinned: true,
    });
    setNoteDraft('');
  };

  const composer = (
    <div className="mx-auto w-full max-w-3xl px-3 pb-4 md:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!voice.recording) submit();
        }}
        className="flex items-end gap-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-lg shadow-primary-blue/5"
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
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-primary-gray outline-none"
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
              : 'bg-gray-100 text-primary-gray hover:bg-primary-blue/10 hover:text-primary-blue'
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
      <p className="mt-2 text-center text-[11px] text-primary-gray/40">
        {voice.recording
          ? 'Gravant… torna a prémer el micròfon per enviar-ho a l’assistent'
          : 'Assistent intern · la veu s’envia directament, sense passar pel recuadre'}
      </p>
    </div>
  );

  const empty = !activeId;

  return (
    <div className="flex h-full min-h-0 bg-[#f7f8fb]" data-lenis-prevent>
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex items-center justify-between gap-2 p-4">
          <span className="text-xs font-black uppercase tracking-widest text-primary-gray/50">
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
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <Search size={14} className="text-primary-gray/40" />
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
            <p className="px-3 py-6 text-sm text-primary-gray/40">Carregant…</p>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-6 text-sm text-primary-gray/40">Encara no hi ha historial.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`group mb-1 flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  activeId === c.id ? 'bg-[var(--primary-blue)]/10' : 'hover:bg-gray-50'
                }`}
              >
                <SquarePen size={14} className="mt-1 shrink-0 text-primary-gray/35" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-primary-gray">
                    {c.title || 'Nova conversa'}
                  </span>
                  <span className="block truncate text-[11px] text-primary-gray/40">
                    {c.preview || formatTime(c.updated_at)}
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleDeleteThread(c.id, e)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeleteThread(c.id, e)}
                  className="hidden rounded-lg p-1 text-primary-gray/30 hover:bg-red-50 hover:text-red-500 group-hover:block"
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
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="rounded-xl border border-gray-100 bg-white p-2 text-primary-blue lg:hidden"
              aria-label="Menú"
            >
              <LayoutDashboard size={20} />
            </button>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-primary-gray md:text-base">
                {thread?.title || 'Assistent d’oficina'}
              </h2>
              <p className="text-[11px] text-primary-gray/45">
                {user?.email || 'Admin'} · independent del xat de la web
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-primary-gray md:hidden"
            >
              Nova
            </button>
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className={`rounded-xl p-2 ${notesOpen ? 'bg-[var(--primary-blue)] text-white' : 'text-primary-gray/50 hover:bg-gray-100'}`}
              title="Notes importants"
            >
              <PanelRight size={18} />
            </button>
          </div>
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 bg-white px-3 py-2 md:hidden">
          {conversations.slice(0, 12).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                activeId === c.id ? 'bg-[var(--primary-blue)] text-white' : 'bg-gray-100 text-primary-gray'
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
              <h3 className="text-2xl font-black tracking-tight text-primary-gray">
                En què treballam avui?
              </h3>
              <p className="mt-2 max-w-md text-sm text-primary-gray/55">
                Cerca clients, prepara potencials iGEO, notes de renovació o ordres. Tot queda desat en aquest historial.
              </p>
              <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-primary-gray/80 hover:border-[var(--primary-blue)]/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4 px-3 py-6 md:px-6">
              {threadLoading && messages.length === 0 ? (
                <p className="text-sm text-primary-gray/40">Carregant fil…</p>
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
                        : 'bg-white text-primary-gray shadow-sm border border-gray-100'
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
              {busy ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-primary-gray/50">
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
        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-gray-200 bg-white lg:flex">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-gray/50">
              <Bookmark size={14} /> Notes
            </span>
            <button type="button" onClick={() => setNotesOpen(false)} className="p-1 text-primary-gray/30">
              <X size={16} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
            {!activeId ? (
              <p className="text-sm text-primary-gray/40">
                Obre una conversa per veure i desar informació important d’aquest fil.
              </p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-primary-gray/40">Cap nota encara. Desa un missatge o n’afegeix una.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-primary-gray">{n.title}</p>
                    <button
                      type="button"
                      onClick={() => deleteNote({ id: n.id, conversation: activeId })}
                      className="text-primary-gray/30 hover:text-red-500"
                      aria-label="Esborrar nota"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-primary-gray/70">{n.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 p-3">
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="Afegir nota important…"
              className="w-full resize-none rounded-xl border border-gray-200 p-2 text-sm outline-none focus:border-[var(--primary-blue)]"
            />
            <button
              type="button"
              onClick={saveManualNote}
              disabled={!noteDraft.trim()}
              className="mt-2 w-full rounded-xl bg-[var(--primary-blue)] py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Desar nota
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
};

export default AdminOpsChat;
