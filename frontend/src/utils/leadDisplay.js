const CRM_STATUS_STYLES = {
  lead: 'bg-orange-100 text-orange-600',
  alta: 'bg-green-100 text-green-600',
  baja: 'bg-slate-200 text-slate-600',
};

const CRM_STATUS_LABELS = {
  lead: 'Lead',
  alta: 'Alta',
  baja: 'Baixa',
};

export const CRM_STATUS_FILTERS = [
  { id: 'all', label: 'Tots' },
  { id: 'lead', label: 'Leads' },
  { id: 'alta', label: 'Altes' },
  { id: 'baja', label: 'Baixes' },
];

export function normalizeLead(lead) {
  if (!lead) return null;

  const rawStatus = (lead.crm_status || lead.status || 'lead').toLowerCase();
  const crmStatus = CRM_STATUS_LABELS[rawStatus] ? rawStatus : 'lead';

  return {
    id: lead.id,
    name: lead.nombre || lead.name || 'Sense nom',
    email: lead.email || '',
    phone: lead.telefono || lead.phone || '',
    documentoFiscal: lead.documento_fiscal || '',
    pest: lead.pest_type || lead.type || 'Cucarachas',
    status: crmStatus,
    crmStatus,
    crmStatusLocked: Boolean(lead.crm_status_locked),
    statusLabel: CRM_STATUS_LABELS[crmStatus],
    statusClass: CRM_STATUS_STYLES[crmStatus],
    appointmentsCount: lead.appointments_count ?? 0,
    lastAppointmentAt: lead.last_appointment_at || null,
    createdAt: lead.created_at,
  };
}

export function formatLeadDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
