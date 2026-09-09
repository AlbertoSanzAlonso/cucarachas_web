import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, X } from 'lucide-react';
import {
  AgendaDataSourceProvider,
  AdminAgendaWorkspace,
  AgendaAppointmentModal,
  BlockModal,
  ConfirmDialog,
  useAdminAgenda,
  useAgendaDataSource,
  useAgendaDate,
} from 'agenda-kit/react';
import { createHttpAgendaDataSource } from 'agenda-kit/adapters';
import { setAgendaConfig } from 'agenda-kit/core';
import API_BASE from '@/config/api';

setAgendaConfig({ timezone: 'Europe/Madrid', slotMinutes: 30 });

function tokenFetch(url, init) {
  const headers = new Headers(init?.headers || {});
  const auth = headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    headers.set('Authorization', `Token ${auth.slice(7)}`);
  }
  if (!headers.has('Content-Type') && init?.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers });
}

const modalClassNames = {
  overlay: 'bg-primary-gray/30 backdrop-blur-sm',
  panel: 'bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 md:p-8',
  header: 'mb-4',
  body: 'space-y-3',
  footer: 'mt-6 flex flex-wrap gap-2 justify-end',
  label: 'text-[10px] font-black uppercase tracking-widest text-primary-gray/40',
  input: 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-primary-gray',
  button: 'rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest bg-primary-blue text-white hover:bg-primary-blue/90 disabled:opacity-40',
  error: 'text-red-600 text-sm font-bold',
};

function matchesAppointmentFilter(apt, nameQuery, serviceFilter) {
  const q = nameQuery.trim().toLowerCase();
  const phoneQ = q.replace(/\s+/g, '');
  const nameOk =
    !q ||
    (apt.customerName || '').toLowerCase().includes(q) ||
    (apt.customerPhone || '').replace(/\s+/g, '').includes(phoneQ);
  const svcOk = !serviceFilter || apt.serviceId === serviceFilter;
  return nameOk && svcOk;
}

function AgendaWorkspaceInner({ token }) {
  const { date, setDate } = useAgendaDate();
  const agenda = useAdminAgenda(token, date);
  const dataSource = useAgendaDataSource();

  const [nameQuery, setNameQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [rangeHits, setRangeHits] = useState([]);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(null); // { id, date }

  const selectedCount = agenda.selection?.times?.size || 0;
  const defaultService = agenda.services?.[0] || null;
  const filtersActive = Boolean(nameQuery.trim() || serviceFilter);

  const matchesFilter = useCallback(
    (apt) => matchesAppointmentFilter(apt, nameQuery, serviceFilter),
    [nameQuery, serviceFilter],
  );

  const dayAppointments = useMemo(
    () => agenda.schedules.flatMap((s) => s.appointments || []),
    [agenda.schedules],
  );

  const dayMatchCount = useMemo(
    () => dayAppointments.filter(matchesFilter).length,
    [dayAppointments, matchesFilter],
  );

  // Preseleccionar servicio por defecto al abrir alta
  useEffect(() => {
    if (!agenda.appointmentFormOpen || agenda.editingId || !defaultService) return;
    const hasService = (agenda.aptDraft.serviceIds || []).some(Boolean);
    if (hasService) return;
    agenda.setAptDraft({
      ...agenda.aptDraft,
      serviceIds: [defaultService.id],
      serviceDurations: [defaultService.durationMinutes],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agenda.appointmentFormOpen, agenda.editingId, defaultService?.id]);

  // Búsqueda multi-día por nombre / tratamiento
  useEffect(() => {
    if (!filtersActive || !dataSource.fetchAppointments) {
      setRangeHits([]);
      setRangeLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setRangeLoading(true);
      try {
        const from = new Date();
        from.setDate(from.getDate() - 30);
        const to = new Date();
        to.setDate(to.getDate() + 90);
        const fromStr = from.toISOString().slice(0, 10);
        const toStr = to.toISOString().slice(0, 10);
        const result = await dataSource.fetchAppointments(fromStr, toStr, token);
        if (cancelled) return;
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.appointments)
            ? result.appointments
            : [];
        const hits = list
          .filter((apt) => apt.status !== 'cancelled')
          .filter((apt) => matchesAppointmentFilter(apt, nameQuery, serviceFilter))
          .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
          .slice(0, 20);
        setRangeHits(hits);
      } catch {
        if (!cancelled) setRangeHits([]);
      } finally {
        if (!cancelled) setRangeLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filtersActive, nameQuery, serviceFilter, dataSource, token]);

  // Abrir detalle tras saltar a otra fecha desde resultados
  useEffect(() => {
    if (!pendingOpen || agenda.loading || date !== pendingOpen.date) return;
    for (const schedule of agenda.schedules) {
      const apt = schedule.appointments?.find((a) => a.id === pendingOpen.id);
      if (apt) {
        agenda.openAppointmentDetail(schedule.staffId, apt);
        setPendingOpen(null);
        return;
      }
    }
    setPendingOpen(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOpen, agenda.loading, agenda.schedules, date]);

  const clearFilters = () => {
    setNameQuery('');
    setServiceFilter('');
    setRangeHits([]);
  };

  const jumpToHit = (apt) => {
    if (apt.date && apt.date !== date) {
      setPendingOpen({ id: apt.id, date: apt.date });
      setDate(apt.date);
      return;
    }
    const schedule = agenda.schedules.find((s) => s.staffId === apt.staffId);
    const dayApt = schedule?.appointments?.find((a) => a.id === apt.id);
    if (dayApt) {
      agenda.openAppointmentDetail(apt.staffId, dayApt);
    } else if (apt.date) {
      setPendingOpen({ id: apt.id, date: apt.date });
    }
  };

  const handleCreateFromSelection = () => {
    if (!agenda.selection || selectedCount === 0) return;
    const startTime = [...agenda.selection.times].sort()[0];
    agenda.openNewAppointment(
      agenda.selection.staffId,
      agenda.selection.staffName,
      startTime,
    );
  };

  const appointmentMode = agenda.viewingAppointment
    ? agenda.detailEditMode
      ? 'edit'
      : 'view'
    : 'create';

  const appointmentOpen = agenda.appointmentFormOpen || Boolean(agenda.viewingAppointment);

  return (
    <>
      <div
        data-agenda-filters=""
        className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center mb-3 px-1"
      >
        <label className="relative flex-1 min-w-[180px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-gray/35 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Buscar por nombre o teléfono…"
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm font-medium text-primary-gray placeholder:text-primary-gray/30 focus:outline-none focus:ring-2 focus:ring-primary-blue/25 focus:border-primary-blue/40"
            aria-label="Buscar citas por nombre o teléfono"
          />
        </label>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-primary-gray min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary-blue/25 focus:border-primary-blue/40"
          aria-label="Filtrar por tratamiento"
        >
          <option value="">Todos los tratamientos</option>
          {(agenda.services || []).map((svc) => (
            <option key={svc.id} value={svc.id}>
              {svc.nameEs}
            </option>
          ))}
        </select>

        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary-gray/50 hover:text-primary-gray hover:bg-primary-gray/5"
          >
            <X size={14} />
            Limpiar
          </button>
        )}

        {filtersActive && (
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40 sm:ml-auto">
            Hoy: {dayMatchCount}/{dayAppointments.length}
            {rangeLoading ? ' · buscando…' : rangeHits.length > 0 ? ` · ${rangeHits.length} en rango` : ''}
          </p>
        )}
      </div>

      {filtersActive && (rangeHits.length > 0 || rangeLoading) && (
        <div
          data-agenda-search-results=""
          className="mb-3 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-gray/40">
              Resultados (±30 / +90 días)
            </p>
            {rangeLoading && (
              <span className="text-[10px] font-bold text-primary-gray/30 uppercase tracking-widest">
                Cargando…
              </span>
            )}
          </div>
          {rangeHits.length === 0 && !rangeLoading ? null : (
            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
              {rangeHits.map((apt) => (
                <li key={apt.id}>
                  <button
                    type="button"
                    onClick={() => jumpToHit(apt)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f8fafc] transition-colors flex flex-wrap items-center gap-x-3 gap-y-1"
                  >
                    <span className="text-xs font-black text-primary-blue tabular-nums">
                      {apt.date} · {apt.startTime}
                    </span>
                    <span className="text-sm font-bold text-primary-gray truncate">
                      {apt.customerName}
                    </span>
                    <span className="text-[11px] font-medium text-primary-gray/45 truncate">
                      {apt.serviceName}
                      {apt.staffName ? ` · ${apt.staffName}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {filtersActive && !rangeLoading && rangeHits.length === 0 && dayMatchCount === 0 && (
        <p className="mb-3 px-1 text-xs font-bold text-primary-gray/40">
          No hay citas que coincidan con el filtro.
        </p>
      )}

      {selectedCount > 0 && !agenda.gridInteractionsLocked && (
        <div
          data-agenda-selection-actions=""
          className="flex flex-wrap items-center gap-2 mb-3 px-1"
        >
          <p className="text-xs font-bold text-primary-gray/50 mr-2">
            {selectedCount} franja{selectedCount === 1 ? '' : 's'} · {agenda.selection.staffName}
          </p>
          <button
            type="button"
            onClick={handleCreateFromSelection}
            className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-accent-green text-white hover:bg-accent-green-hv shadow-sm"
          >
            Nueva cita
          </button>
          <button
            type="button"
            onClick={() => agenda.requestBlockSelectedSlots()}
            className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-gray/10 text-primary-gray hover:bg-primary-gray/15"
          >
            Bloquear
          </button>
          <button
            type="button"
            onClick={() => agenda.clearSelection()}
            className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary-gray/40 hover:text-primary-gray"
          >
            Cancelar
          </button>
        </div>
      )}

      <AdminAgendaWorkspace
        date={date}
        onDateChange={setDate}
        agenda={agenda}
        classNames={{
          root: 'cecsa-agenda-root bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden',
          header: 'cecsa-agenda-header border-b border-gray-50 px-4 md:px-6 py-4',
          main: 'cecsa-agenda-main p-2 md:p-4 min-h-[560px]',
          error: 'text-red-600 text-sm font-bold mt-2',
          loading: 'text-primary-gray/40 font-bold uppercase tracking-widest text-center py-16',
        }}
        slots={{
          controlBarExtra: (
            <button
              type="button"
              onClick={() => {
                const staffId = agenda.activeStaffId || agenda.schedules[0]?.staffId;
                if (!staffId) return;
                const name = agenda.schedules.find((s) => s.staffId === staffId)?.staffName || '';
                agenda.openNewAppointment(staffId, name);
              }}
              className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary-blue text-white hover:bg-primary-blue/90"
            >
              + Cita
            </button>
          ),
          filterAppointment: filtersActive ? matchesFilter : undefined,
          eventContent: (apt) => (
            <div className="px-1.5 py-1 text-left overflow-hidden">
              <p className="text-[11px] font-black truncate leading-tight">{apt.customerName}</p>
              <p className="text-[10px] opacity-80 truncate">
                {apt.startTime} · {apt.serviceName}
              </p>
              {apt.customerNotes ? (
                <p className="text-[9px] opacity-70 truncate mt-0.5">{apt.customerNotes}</p>
              ) : null}
            </div>
          ),
        }}
      />

      <AgendaAppointmentModal
        open={appointmentOpen}
        mode={appointmentMode}
        date={agenda.aptDraft.date || date}
        staffName={
          agenda.viewingAppointment?.staffName ||
          agenda.schedules.find((s) => s.staffId === agenda.activeStaffId)?.staffName
        }
        draft={agenda.aptDraft}
        services={agenda.services}
        slots={agenda.slots}
        saving={agenda.isSubmitting}
        error={agenda.error}
        classNames={modalClassNames}
        onDraftChange={(patch) => agenda.setAptDraft({ ...agenda.aptDraft, ...patch })}
        onSubmit={() => void agenda.saveAppointment()}
        onClose={() => {
          if (agenda.viewingAppointment) agenda.closeAppointmentDetail();
          else {
            agenda.setAppointmentFormOpen(false);
            agenda.resetAppointmentForm();
          }
        }}
        onStartEdit={agenda.startDetailEdit}
        onCancelAppointment={
          agenda.editingId
            ? () => agenda.cancelAppointmentById(agenda.editingId)
            : undefined
        }
        onMarkNoShow={
          agenda.editingId ? () => agenda.markNoShowById(agenda.editingId) : undefined
        }
      />

      <BlockModal
        open={agenda.blockModalOpen || Boolean(agenda.viewingBlock)}
        mode={agenda.viewingBlock ? 'detail' : 'create'}
        date={date}
        staffName={
          agenda.viewingBlock?.staffName ||
          agenda.selection?.staffName ||
          ''
        }
        groups={agenda.viewingBlock ? null : agenda.pendingBlockGroups}
        block={agenda.viewingBlock?.block || null}
        note={agenda.blockNote}
        busy={agenda.blockDetailBusy || agenda.gridActionsBusy}
        classNames={modalClassNames}
        onNoteChange={agenda.setBlockNote}
        onConfirmCreate={(note) => void agenda.confirmBlockWithScope('single', undefined, note)}
        onSaveNote={(note) => {
          agenda.setBlockNote(note);
          void agenda.saveBlockNote();
        }}
        onDelete={() => void agenda.deleteViewingBlock()}
        onClose={() => {
          if (agenda.viewingBlock) agenda.closeBlockDetail();
          else agenda.cancelBlockModal();
        }}
      />

      <ConfirmDialog
        open={Boolean(agenda.confirmDialog)}
        title={agenda.confirmDialog?.title || ''}
        message={agenda.confirmDialog?.message}
        confirmLabel={agenda.confirmDialog?.confirmLabel}
        busy={agenda.confirmBusy}
        classNames={modalClassNames}
        onConfirm={() => void agenda.runConfirmDialog()}
        onClose={agenda.closeConfirmDialog}
      />
    </>
  );
}

const CalendarManager = () => {
  const token = useSelector((state) => state.auth.token);
  const dataSource = useMemo(
    () =>
      createHttpAgendaDataSource({
        baseUrl: `${API_BASE}/api/agenda`,
        fetchFn: tokenFetch,
      }),
    [],
  );

  if (!token) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center text-primary-gray/40 font-bold">
        Cal autenticació per veure l&apos;agenda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-primary-gray uppercase tracking-tight">
            Agenda
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-gray/40 mt-1">
            Busca por nombre · Filtra por tratamiento · Europa/Madrid
          </p>
        </div>
      </div>
      <AgendaDataSourceProvider dataSource={dataSource}>
        <AgendaWorkspaceInner token={token} />
      </AgendaDataSourceProvider>
    </div>
  );
};

export default CalendarManager;
