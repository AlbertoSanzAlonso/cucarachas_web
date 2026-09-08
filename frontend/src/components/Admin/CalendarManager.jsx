import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  AgendaDataSourceProvider,
  AdminAgendaWorkspace,
  useAdminAgenda,
  useAgendaDate,
} from 'agenda-kit/react';
import { createHttpAgendaDataSource } from 'agenda-kit/adapters';
import { setAgendaConfig } from 'agenda-kit/core';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.cucarachasbarcelona.cat';

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

function AgendaWorkspaceInner({ token }) {
  const { date, setDate } = useAgendaDate();
  const agenda = useAdminAgenda(token, date);

  return (
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
  );
}

/**
 * Agenda admin CECSA — UI headless de agenda-kit + estilos del proyecto.
 */
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
            Primera revisió · Europa/Madrid
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
