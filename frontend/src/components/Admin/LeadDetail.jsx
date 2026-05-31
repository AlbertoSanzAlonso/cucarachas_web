import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from 'lucide-react';
import LeadEditModal from '@/components/Admin/LeadEditModal';
import ConfirmModal from '@/components/Admin/ConfirmModal';
import { useDeleteLeadMutation } from '@/store/apis/leadsApi';
import { normalizeLead, formatLeadDate } from '@/utils/leadDisplay';
import {
  filterBookingsForLead,
  getBookingAddress,
  getBookingStatusClass,
} from '@/utils/leadBookings';
import { useCalBookings } from '@/hooks/useCalBookings';
import { getBookingDisplayTitle } from '@/components/Admin/BookingDetailModal';

const PREVIEW_BOOKINGS_LIMIT = 3;

const formatBookingDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ca-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LeadDetail = ({ leadRaw, onBack }) => {
  const lead = normalizeLead(leadRaw);
  const { bookings, isLoading, isError, refetch } = useCalBookings();
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();

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
          'No s\'ha pogut eliminar el lead. Pot tenir dades vinculades al sistema.'
      );
    }
  };

  useEffect(() => {
    setShowAllBookings(false);
  }, [lead?.id]);

  if (!lead) {
    return (
      <div className="text-center py-20 text-primary-gray/40">
        Lead no trobat.
        <button onClick={onBack} className="block mx-auto mt-4 text-primary-blue font-bold">
          Tornar
        </button>
      </div>
    );
  }

  const leadBookings = filterBookingsForLead(bookings, lead);
  const hasMoreBookings = leadBookings.length > PREVIEW_BOOKINGS_LIMIT;
  const visibleBookings = showAllBookings
    ? leadBookings
    : leadBookings.slice(0, PREVIEW_BOOKINGS_LIMIT);

  const renderBookingCard = (booking, i) => {
    const address = getBookingAddress(booking);
    return (
      <motion.div
        key={booking.uid || booking.id || i}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
        className="p-5 md:p-6 rounded-[2rem] border border-gray-100 bg-gray-50/30 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-black text-primary-gray text-base md:text-lg">
              {getBookingDisplayTitle(booking)}
            </p>
            <p className="flex items-center gap-2 text-sm text-primary-gray/60 font-medium mt-2">
              <Clock size={16} className="text-primary-blue shrink-0" />
              {formatBookingDate(booking.startTime)}
            </p>
          </div>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getBookingStatusClass(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        {address && (
          <p className="flex items-start gap-2 text-sm text-primary-gray/60 font-medium mb-4">
            <MapPin size={16} className="text-primary-blue shrink-0 mt-0.5" />
            {address}
          </p>
        )}

        {booking.uid && (
          <a
            href={`https://app.cal.eu/bookings/${booking.uid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary-blue hover:underline"
          >
            <ExternalLink size={14} />
            Obrir a Cal.com
          </a>
        )}
      </motion.div>
    );
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-blue font-bold text-sm mb-8 hover:underline"
      >
        <ArrowLeft size={18} />
        Tornar als leads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead info */}
        <section className="lg:col-span-1 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50">
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
            <h2 className="text-xl md:text-2xl font-black text-primary-gray uppercase tracking-tight leading-tight">
              {lead.name}
            </h2>
            <p className="text-sm text-primary-gray/40 font-medium mt-1">
              Registrat el {formatLeadDate(lead.createdAt) || '—'}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            {lead.email && (
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-primary-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-primary-gray/30 tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-primary-gray break-all">{lead.email}</p>
                </div>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-primary-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-primary-gray/30 tracking-widest mb-1">Telèfon</p>
                  <p className="text-sm font-medium text-primary-gray">{lead.phone}</p>
                </div>
              </div>
            )}
            {lead.documentoFiscal && (
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-primary-blue mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-primary-gray/30 tracking-widest mb-1">Document</p>
                  <p className="text-sm font-medium text-primary-gray">{lead.documentoFiscal}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-primary-blue mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase text-primary-gray/30 tracking-widest mb-1">Plaga</p>
                <p className="text-sm font-medium text-primary-gray">{lead.pest}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Appointment history */}
        <section className="lg:col-span-2 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg md:text-xl font-black text-primary-gray uppercase tracking-tight">
                Historial de Cites
              </h3>
              <p className="text-sm text-primary-gray/40 font-medium mt-1">
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
              <div className="flex flex-col items-center justify-center py-16 text-primary-gray/40">
                <div className="w-10 h-10 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Carregant cites...</p>
              </div>
            ) : isError ? (
              <div className="p-8 bg-red-50 rounded-2xl text-center">
                <p className="text-red-600 font-bold mb-1">Error de connexió</p>
                <p className="text-red-400 text-sm">No s&apos;ha pogut obtenir l&apos;historial de Cal.com.</p>
              </div>
            ) : leadBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                <Calendar size={40} className="text-gray-300 mb-4" />
                <p className="text-sm font-bold text-primary-gray/60 uppercase tracking-widest">
                  Sense cites registrades
                </p>
                <p className="text-xs text-primary-gray/40 mt-2 max-w-xs">
                  Aquest client encara no té reserves vinculades per email o telèfon.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`space-y-4 overflow-y-auto overscroll-contain pr-1 ${
                    showAllBookings ? 'max-h-[min(560px,65vh)]' : ''
                  }`}
                  data-lenis-prevent
                >
                  {visibleBookings.map((booking, i) => renderBookingCard(booking, i))}
                </div>

                {hasMoreBookings && (
                  <button
                    type="button"
                    onClick={() => setShowAllBookings((prev) => !prev)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary-blue/15 bg-primary-blue/5 text-primary-blue font-bold text-sm hover:bg-primary-blue/10 transition-colors"
                  >
                    {showAllBookings ? (
                      <>
                        <ChevronUp size={18} />
                        Mostrar només les últimes {PREVIEW_BOOKINGS_LIMIT}
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} />
                        Veure llista completa ({leadBookings.length} cites)
                      </>
                    )}
                  </button>
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
        title="Eliminar lead"
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
