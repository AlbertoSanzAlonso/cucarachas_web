import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  FileText,
  User,
  ArrowUpRight,
  Pencil,
  Trash2,
  RefreshCcw,
} from 'lucide-react';
import LeadEditModal from '@/components/Admin/LeadEditModal';
import ConfirmModal from '@/components/Admin/ConfirmModal';
import LeadBookingCard from '@/components/Admin/LeadBookingCard';
import {
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
  useUnlockLeadStatusMutation,
} from '@/store/apis/leadsApi';
import { normalizeLead, formatLeadDate } from '@/utils/leadDisplay';
import { filterBookingsForLead } from '@/utils/leadBookings';
import { useCalBookings } from '@/hooks/useCalBookings';

const PREVIEW_BOOKINGS_LIMIT = 3;

const CRM_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'alta', label: 'Alta' },
  { value: 'baja', label: 'Baixa' },
];

const LeadDetail = ({ leadRaw, onBack }) => {
  const lead = normalizeLead(leadRaw);
  const { bookings, isLoading, isError, refetch } = useCalBookings();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [updateLeadStatus, { isLoading: isUpdatingStatus }] = useUpdateLeadStatusMutation();
  const [unlockLeadStatus, { isLoading: isUnlocking }] = useUnlockLeadStatusMutation();

  const handleCloseDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    setDeleteError(null);
    try {
      await deleteLead(leadRaw.id).unwrap();
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      setDeleteError(
        err?.data?.detail ||
          'No s\'ha pogut eliminar el contacte. Pot tenir dades vinculades al sistema.'
      );
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!leadRaw?.id || nextStatus === lead?.crmStatus) return;
    setStatusError(null);
    try {
      await updateLeadStatus({ id: leadRaw.id, status: nextStatus }).unwrap();
    } catch (err) {
      setStatusError(
        err?.data?.crm_status?.[0] ||
          err?.data?.detail ||
          'No s\'ha pogut actualitzar l\'estat CRM.'
      );
    }
  };

  const handleUnlock = async () => {
    if (!leadRaw?.id) return;
    setStatusError(null);
    try {
      await unlockLeadStatus(leadRaw.id).unwrap();
    } catch (err) {
      setStatusError(
        err?.data?.detail || 'No s\'ha pogut tornar al mode automàtic.'
      );
    }
  };

  if (!lead) {
    return (
      <div className="text-center py-20 text-admin-text-muted">
        Client no trobat.
        <button onClick={onBack} className="block mx-auto mt-4 text-primary-blue font-bold">
          Tornar
        </button>
      </div>
    );
  }

  const leadBookings = filterBookingsForLead(bookings, lead);
  const previewBookings = leadBookings.slice(0, PREVIEW_BOOKINGS_LIMIT);
  const hasMoreBookings = leadBookings.length > PREVIEW_BOOKINGS_LIMIT;
  const statusBusy = isUpdatingStatus || isUnlocking;

  return (
    <div className="animate-fade-in pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-blue font-bold text-sm mb-8 hover:underline"
      >
        <ArrowLeft size={18} />
        Tornar als clients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <section className="lg:col-span-1 bg-admin-card rounded-3xl md:rounded-[3rem] shadow-sm border border-admin-border">
          <div className="p-6 md:p-8 border-b border-admin-border">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="p-3 bg-primary-blue/5 rounded-2xl text-primary-blue">
                <User size={24} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${lead.statusClass}`}>
                  {lead.statusLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-blue/15 bg-primary-blue/5 text-primary-blue text-xs font-bold hover:bg-primary-blue/10 transition-colors"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setShowDeleteConfirm(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-admin-text uppercase tracking-tight leading-tight">
              {lead.name}
            </h2>
            <p className="text-sm text-admin-text-muted font-medium mt-1">
              Registrat el {formatLeadDate(lead.createdAt) || '—'}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase text-admin-text-muted tracking-widest mb-2">
                Estat CRM
              </p>
              <select
                value={lead.crmStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusBusy}
                className="w-full px-4 py-3 rounded-xl border border-admin-border bg-admin-muted text-sm font-bold text-admin-text cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {CRM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">
                  {lead.crmStatusLocked ? 'Manual' : 'Automàtic'}
                </p>
                {lead.crmStatusLocked && (
                  <button
                    type="button"
                    onClick={handleUnlock}
                    disabled={statusBusy}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-blue hover:underline disabled:opacity-40"
                  >
                    <RefreshCcw size={12} />
                    Tornar a automàtic
                  </button>
                )}
              </div>
              {statusError && (
                <p className="mt-2 text-xs text-red-500 font-medium">{statusError}</p>
              )}
            </div>

            {lead.email && (
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-primary-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-admin-text-muted tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-admin-text break-all">{lead.email}</p>
                </div>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-primary-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-admin-text-muted tracking-widest mb-1">Telèfon</p>
                  <p className="text-sm font-medium text-admin-text">{lead.phone}</p>
                </div>
              </div>
            )}
            {lead.documentoFiscal && (
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-primary-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-admin-text-muted tracking-widest mb-1">Document</p>
                  <p className="text-sm font-medium text-admin-text">{lead.documentoFiscal}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-primary-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase text-admin-text-muted tracking-widest mb-1">Plaga</p>
                <p className="text-sm font-medium text-admin-text">{lead.pest}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-primary-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase text-admin-text-muted tracking-widest mb-1">Cites agenda</p>
                <p className="text-sm font-medium text-admin-text">{lead.appointmentsCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 bg-admin-card rounded-3xl md:rounded-[3rem] shadow-sm border border-admin-border">
          <div className="p-6 md:p-8 border-b border-admin-border flex justify-between items-center">
            <div>
              <h3 className="text-lg md:text-xl font-black text-admin-text uppercase tracking-tight">
                Historial de Cites
              </h3>
              <p className="text-sm text-admin-text-muted font-medium mt-1">
                {isLoading ? 'Sincronitzant...' : `${leadBookings.length} cita${leadBookings.length === 1 ? '' : 's'} trobada${leadBookings.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <button
              onClick={refetch}
              disabled={isLoading}
              className="text-xs font-bold text-primary-blue hover:underline disabled:opacity-40"
            >
              Actualitzar
            </button>
          </div>

          <div className="p-6 md:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-admin-text-muted">
                <div className="w-10 h-10 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Carregant cites...</p>
              </div>
            ) : isError ? (
              <div className="p-8 bg-red-50 rounded-2xl text-center">
                <p className="text-red-600 font-bold mb-1">Error de connexió</p>
                <p className="text-red-400 text-sm">No s&apos;ha pogut obtenir l&apos;historial de cites.</p>
              </div>
            ) : leadBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                <Calendar size={40} className="text-admin-text-muted mb-4" />
                <p className="text-sm font-bold text-admin-text-muted uppercase tracking-widest">
                  Sense cites registrades
                </p>
                <p className="text-xs text-admin-text-muted mt-2 max-w-xs">
                  Aquest contacte encara no té reserves vinculades per email o telèfon.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {previewBookings.map((booking, i) => (
                    <LeadBookingCard key={booking.uid || booking.id || i} booking={booking} index={i} />
                  ))}
                </div>

                {hasMoreBookings && (
                  <Link
                    to={`/admin/leads/${leadRaw.id}/cites`}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary-blue/15 bg-primary-blue/5 text-primary-blue font-bold text-sm hover:bg-primary-blue/10 transition-colors"
                  >
                    Veure totes les cites ({leadBookings.length})
                    <ArrowUpRight size={18} />
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <LeadEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        leadRaw={leadRaw}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Eliminar contacte"
        message={`Estàs segur que vols eliminar «${lead.name}»? Es perdran les dades del contacte al CRM. Aquesta acció no es pot desfer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="No, tornar"
        variant="danger"
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default LeadDetail;
