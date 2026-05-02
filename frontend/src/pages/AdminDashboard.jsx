import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

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
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
        <TopBar 
          user={user}
          setSidebarOpen={setSidebarOpen}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          setIsProfileModalOpen={setIsProfileModalOpen}
          handleLogout={handleLogout}
        />

        {activeTab === 'overview' ? (
          <DashboardOverview leads={leads} isLoading={isLoading} isError={isError} />
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
