import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetLeadsQuery } from '@/store/apis/leadsApi';
import { logout } from '@/store/slices/authSlice';
import Sidebar from '@/components/Admin/Sidebar';
import TopBar from '@/components/Admin/TopBar';
import LeadBookingCard from '@/components/Admin/LeadBookingCard';
import { normalizeLead } from '@/utils/leadDisplay';
import { filterBookingsForLead } from '@/utils/leadBookings';
import { useCalBookings } from '@/hooks/useCalBookings';

const LeadBookingsPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const parsedLeadId = Number(leadId);
  const { data: leads, isLoading: leadsLoading } = useGetLeadsQuery();
  const { bookings, isLoading: bookingsLoading, isError, refetch } = useCalBookings();

  const leadRaw = (leads || []).find((l) => l.id === parsedLeadId);
  const lead = leadRaw ? normalizeLead(leadRaw) : null;
  const leadBookings = lead ? filterBookingsForLead(bookings, lead) : [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleBackToLead = () => {
    navigate('/admin', { state: { selectedLeadId: parsedLeadId, activeTab: 'leads' } });
  };

  const handleSetActiveTab = (tab) => {
    navigate('/admin', { state: { activeTab: tab } });
  };

  const isLoading = leadsLoading || bookingsLoading;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Helmet>
        <title>
          {lead ? `Cites de ${lead.name} | CECSA` : 'Cites del lead | CECSA'}
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab="leads"
        setActiveTab={handleSetActiveTab}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <TopBar
          user={user}
          leads={leads}
          setSidebarOpen={setSidebarOpen}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          setIsProfileModalOpen={() => {}}
          setActiveTab={handleSetActiveTab}
          onSelectLead={(id) => navigate('/admin', { state: { selectedLeadId: id, activeTab: 'leads' } })}
          onViewAllLeads={() => navigate('/admin', { state: { activeTab: 'leads' } })}
          handleLogout={handleLogout}
        />

        <div className="animate-fade-in max-w-4xl">
          <button
            type="button"
            onClick={handleBackToLead}
            className="flex items-center gap-2 text-primary-blue font-bold text-sm mb-8 hover:underline"
          >
            <ArrowLeft size={18} />
            Tornar al lead
          </button>

          <div className="bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-gray-100">
            <div className="p-6 md:p-8 border-b border-gray-50 flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-primary-gray uppercase tracking-tight">
                  {lead ? `Cites de ${lead.name}` : 'Cites del lead'}
                </h1>
                <p className="text-sm text-primary-gray/40 font-medium mt-1">
                  {isLoading
                    ? 'Sincronitzant...'
                    : `${leadBookings.length} cita${leadBookings.length === 1 ? '' : 's'} trobada${leadBookings.length === 1 ? '' : 's'}`}
                </p>
              </div>
              <button
                type="button"
                onClick={refetch}
                disabled={isLoading}
                className="text-xs font-bold text-primary-blue hover:underline disabled:opacity-40"
              >
                Actualitzar
              </button>
            </div>

            <div className="p-6 md:p-8 pb-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-primary-gray/40">
                  <div className="w-10 h-10 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Carregant cites...</p>
                </div>
              ) : !lead ? (
                <div className="p-8 bg-red-50 rounded-2xl text-center">
                  <p className="text-red-600 font-bold mb-1">Lead no trobat</p>
                  <p className="text-red-400 text-sm">Aquest contacte no existeix al CRM.</p>
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
                </div>
              ) : (
                <div className="space-y-4">
                  {leadBookings.map((booking, i) => (
                    <LeadBookingCard key={booking.uid || booking.id || i} booking={booking} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadBookingsPage;
