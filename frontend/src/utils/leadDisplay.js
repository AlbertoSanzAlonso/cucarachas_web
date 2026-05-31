const STATUS_STYLES = {
  urgent: 'bg-red-100 text-red-600',
  urgente: 'bg-red-100 text-red-600',
  pending: 'bg-orange-100 text-orange-600',
  pendiente: 'bg-orange-100 text-orange-600',
  pendent: 'bg-orange-100 text-orange-600',
  completed: 'bg-green-100 text-green-600',
  completado: 'bg-green-100 text-green-600',
  nou: 'bg-blue-100 text-blue-600',
};

const STATUS_LABELS = {
  urgent: 'Urgent',
  urgente: 'Urgent',
  pending: 'Pendent',
  pendiente: 'Pendent',
  pendent: 'Pendent',
  completed: 'Completat',
  completado: 'Completat',
  nou: 'Nou',
};

export function normalizeLead(lead) {
  if (!lead) return null;

  const rawStatus = (lead.status || 'nou').toLowerCase();

  return {
    id: lead.id,
    name: lead.nombre || lead.name || 'Sense nom',
    email: lead.email || '',
    phone: lead.telefono || lead.phone || '',
    documentoFiscal: lead.documento_fiscal || '',
    pest: lead.pest_type || lead.type || 'Cucarachas',
    status: rawStatus,
    statusLabel: STATUS_LABELS[rawStatus] || lead.status || 'Nou',
    statusClass: STATUS_STYLES[rawStatus] || 'bg-blue-100 text-blue-600',
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
