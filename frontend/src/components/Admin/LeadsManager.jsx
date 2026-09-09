import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, ChevronRight, Calendar } from 'lucide-react';
import { normalizeLead, formatLeadDate, CRM_STATUS_FILTERS } from '@/utils/leadDisplay';
import LeadDetail from '@/components/Admin/LeadDetail';

const LeadsManager = ({ leads, isLoading, isError, selectedLeadId, onSelectLead, onClearSelection }) => {
  const [filter, setFilter] = useState('all');
  const normalizedLeads = useMemo(
    () => (leads || []).map(normalizeLead).filter(Boolean),
    [leads],
  );

  const counts = useMemo(() => {
    const base = { all: normalizedLeads.length, lead: 0, alta: 0, baja: 0 };
    for (const lead of normalizedLeads) {
      if (base[lead.crmStatus] !== undefined) base[lead.crmStatus] += 1;
    }
    return base;
  }, [normalizedLeads]);

  const filteredLeads = useMemo(() => {
    if (filter === 'all') return normalizedLeads;
    return normalizedLeads.filter((lead) => lead.crmStatus === filter);
  }, [normalizedLeads, filter]);

  const selectedLeadRaw = (leads || []).find((l) => l.id === selectedLeadId);

  if (selectedLeadId && selectedLeadRaw) {
    return (
      <LeadDetail
        leadRaw={selectedLeadRaw}
        onBack={onClearSelection}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-primary-gray uppercase tracking-tight">
            Clients
          </h2>
          <p className="text-primary-gray/40 font-medium text-sm">
            {isLoading
              ? 'Carregant...'
              : `${normalizedLeads.length} registres · leads, altes i baixes`}
          </p>
        </div>
        <div className="p-3 bg-primary-blue/5 rounded-2xl text-primary-blue">
          <Users size={24} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CRM_STATUS_FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                active
                  ? 'bg-primary-blue text-white'
                  : 'bg-white border border-gray-100 text-primary-gray/50 hover:text-primary-blue hover:border-primary-blue/20'
              }`}
            >
              {item.label}
              <span
                className={`min-w-[1.25rem] px-1.5 py-0.5 rounded-lg text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-50 text-primary-gray/40'
                }`}
              >
                {counts[item.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <section className="bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Client</th>
                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Correu</th>
                <th className="hidden md:table-cell px-6 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Telèfon</th>
                <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest text-center">Estat</th>
                <th className="hidden sm:table-cell px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Cites</th>
                <th className="hidden lg:table-cell px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Alta</th>
                <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-primary-gray/40 font-bold uppercase tracking-widest animate-pulse">
                    Carregant dades sanitàries...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-red-500 font-bold">
                    Error al connectar amb el sistema de control.
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-primary-gray/40">
                    No hi ha registres en aquesta categoria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onSelectLead(lead.id)}
                    className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 md:px-8 py-5">
                      <p className="font-bold text-sm md:text-base text-primary-gray leading-none mb-1">{lead.name}</p>
                      <div className="md:hidden space-y-0.5 mt-1">
                        {lead.email && (
                          <p className="flex items-center gap-1.5 text-[10px] text-primary-gray/40">
                            <Mail size={12} className="shrink-0" />
                            {lead.email}
                          </p>
                        )}
                        {lead.phone && (
                          <p className="flex items-center gap-1.5 text-[10px] text-primary-gray/40">
                            <Phone size={12} className="shrink-0" />
                            {lead.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-5">
                      {lead.email ? (
                        <p className="flex items-center gap-2 text-sm text-primary-gray/70 break-all">
                          <Mail size={14} className="text-primary-blue shrink-0" />
                          {lead.email}
                        </p>
                      ) : (
                        <span className="text-sm text-primary-gray/30">—</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-6 py-5">
                      {lead.phone ? (
                        <p className="flex items-center gap-2 text-sm text-primary-gray/70">
                          <Phone size={14} className="text-primary-blue shrink-0" />
                          {lead.phone}
                        </p>
                      ) : (
                        <span className="text-sm text-primary-gray/30">—</span>
                      )}
                    </td>
                    <td className="px-4 md:px-8 py-5 text-center">
                      <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest ${lead.statusClass}`}>
                        {lead.statusLabel}
                      </span>
                      {lead.crmStatusLocked && (
                        <p className="text-[9px] text-primary-gray/30 font-bold uppercase tracking-widest mt-1">
                          Manual
                        </p>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-4 md:px-8 py-5">
                      <p className="flex items-center gap-1.5 text-sm text-primary-gray/60 font-medium">
                        <Calendar size={14} className="text-primary-blue shrink-0" />
                        {lead.appointmentsCount}
                      </p>
                    </td>
                    <td className="hidden lg:table-cell px-4 md:px-8 py-5 text-sm text-primary-gray/50 font-medium">
                      {formatLeadDate(lead.createdAt)}
                    </td>
                    <td className="px-4 md:px-8 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead.id);
                        }}
                        className="p-2 hover:bg-primary-blue/5 rounded-xl text-primary-blue transition-colors"
                        aria-label="Veure detall del client"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LeadsManager;
