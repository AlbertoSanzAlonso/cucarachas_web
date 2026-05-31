import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetLeadsQuery } from '@/store/apis/leadsApi';
import { logout } from '@/store/slices/authSlice';

// Modular Components
import Sidebar from '@/components/Admin/Sidebar';
import TopBar from '@/components/Admin/TopBar';
import DashboardOverview from '@/components/Admin/DashboardOverview';
import WebmailAccess from '@/components/Admin/WebmailAccess';
import ProfileModal from '@/components/Admin/ProfileModal';
import CalendarManager from '@/components/Admin/CalendarManager';
import LeadsManager from '@/components/Admin/LeadsManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  React.useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.activeTab) setActiveTab(state.activeTab);
    if (state.selectedLeadId != null) setSelectedLeadId(state.selectedLeadId);
  }, [location.state]);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    password: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Hook up to real data from Redux
  const { data: leads, isLoading, isError } = useGetLeadsQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    alert("Gestió de perfil directament via Django Admin o implementació pendent.");
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeadId(leadId);
    setActiveTab('leads');
  };

  const handleViewAllLeads = () => {
    setSelectedLeadId(null);
    setActiveTab('leads');
  };

  const handleSetActiveTab = (tab) => {
    setSelectedLeadId(null);
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden relative">
      <Helmet>
        <title>Admin Dashboard | CECSA</title>
        <meta name="author" content="Alberto Sanz (albertosanz.dev)" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12" data-lenis-prevent>
        <TopBar 
          user={user}
          leads={leads}
          setSidebarOpen={setSidebarOpen}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          setIsProfileModalOpen={setIsProfileModalOpen}
          setActiveTab={handleSetActiveTab}
          onSelectLead={handleSelectLead}
          onViewAllLeads={handleViewAllLeads}
          handleLogout={handleLogout}
        />

        {activeTab === 'overview' ? (
          <DashboardOverview
            leads={leads}
            isLoading={isLoading}
            isError={isError}
            setActiveTab={handleSetActiveTab}
            onSelectLead={handleSelectLead}
            onViewAllLeads={handleViewAllLeads}
          />
        ) : activeTab === 'leads' ? (
          <LeadsManager
            leads={leads}
            isLoading={isLoading}
            isError={isError}
            selectedLeadId={selectedLeadId}
            onSelectLead={handleSelectLead}
            onClearSelection={() => setSelectedLeadId(null)}
          />
        ) : activeTab === 'mail' ? (
          <WebmailAccess />
        ) : activeTab === 'calendar' ? (
          <CalendarManager />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-6 bg-gray-100 rounded-full mb-6">
               <LayoutDashboard size={48} className="text-primary-gray/20" />
            </div>
            <h2 className="text-2xl font-black text-primary-gray uppercase tracking-tight">Secció en Desenvolupament</h2>
            <p className="text-primary-gray/40 font-medium">Estem treballant en el protocol d'aquesta secció.</p>
          </div>
        )}
      </main>

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        profileData={profileData}
        setProfileData={setProfileData}
        handleUpdateProfile={handleUpdateProfile}
        isUpdating={isUpdating}
        updateSuccess={updateSuccess}
      />
    </div>
  );
};

export default AdminDashboard;
