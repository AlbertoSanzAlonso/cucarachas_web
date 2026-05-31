import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import { normalizeLead, formatLeadDate } from '@/utils/leadDisplay';

const DashboardOverview = ({ leads, isLoading, isError, setActiveTab }) => {
  const normalizedLeads = (leads || []).map(normalizeLead).filter(Boolean);

  const stats = [
    { id: 'active', title: 'Tractaments Actius', value: '--', icon: <Activity className="text-accent-green" />, trend: '...', tab: null },
    { id: 'leads', title: 'Leads Pendents', value: String(normalizedLeads.length), icon: <MessageSquare className="text-primary-blue" />, trend: 'Actual', tab: 'leads' },
    { id: 'calendar', title: 'Cites d\'avui', value: '--', icon: <Calendar className="text-accent-green" />, trend: 'Cal.com', tab: 'calendar' },
    { id: 'teams', title: 'Equips en Ruta', value: '--', icon: <TrendingUp className="text-primary-blue" />, trend: '...', tab: null },
  ];

  const handleStatClick = (tab) => {
    if (tab) setActiveTab(tab);
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
        {stats.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleStatClick(item.tab)}
            className={`bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-primary-blue/5 transition-all group ${
              item.tab ? 'cursor-pointer' : 'cursor-default opacity-90'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-primary-blue/5 transition-colors">
                {item.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${item.trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {item.trend}
              </span>
            </div>
            <p className="text-primary-gray/40 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1">{item.title}</p>
            <p className="text-2xl md:text-4xl font-black text-primary-gray tracking-tighter">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <section className="lg:col-span-2 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-black text-primary-gray uppercase tracking-tight">Leads Recents</h2>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-primary-blue font-bold text-xs md:text-sm hover:underline"
            >
              Veure tots
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Client</th>
                  <th className="hidden md:table-cell px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest">Plaga</th>
                  <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest text-center">Estat</th>
                  <th className="px-4 md:px-8 py-4 text-[10px] font-black uppercase text-primary-gray/30 tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan="4" className="text-center py-10 text-primary-gray/40 font-bold uppercase tracking-widest animate-pulse">Carregant dades sanitàries...</td></tr>
                ) : isError ? (
                  <tr><td colSpan="4" className="text-center py-10 text-red-500 font-bold">Error al connectar amb el sistema de control.</td></tr>
                ) : normalizedLeads.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-primary-gray/40">No hi ha leads pendents.</td></tr>
                ) : normalizedLeads.slice(0, 4).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 md:px-8 py-5">
                      <p className="font-bold text-sm md:text-base text-primary-gray leading-none mb-1">{lead.name}</p>
                      <p className="text-[10px] text-primary-gray/40">{lead.email || formatLeadDate(lead.createdAt) || 'Recent'}</p>
                    </td>
                    <td className="hidden md:table-cell px-8 py-5">
                      <span className="text-sm text-primary-gray/70 font-medium">{lead.pest}</span>
                    </td>
                    <td className="px-4 md:px-8 py-5 text-center">
                      <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest ${lead.statusClass}`}>
                        {lead.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-5 text-right">
                      <button
                        onClick={() => setActiveTab('leads')}
                        className="p-2 hover:bg-primary-blue/5 rounded-xl text-primary-blue transition-colors"
                        aria-label="Veure lead"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Calendar Summary Section */}
        <section className="bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-primary-gray uppercase tracking-tight">Pròximes Cites</h2>
            <Calendar size={20} className="text-primary-blue" />
          </div>
          <div className="p-8 space-y-4 flex-1">
             <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-6">
                <Calendar size={32} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Consulta la secció Agenda<br/>per veure les teves cites</p>
             </div>
          </div>
          <div className="p-4">
            <button 
              onClick={() => setActiveTab('calendar')}
              className="w-full bg-primary-blue rounded-[2rem] p-6 text-white text-center font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Gestionar Agenda
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default DashboardOverview;
