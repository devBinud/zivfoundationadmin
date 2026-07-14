/* App - Routing & Layout Setup */

import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserDirectory from './pages/UserDirectory';
import PartnerDirectory from './pages/PartnerDirectory';
import AddOrganization from './pages/AddOrganization';
import RequestModeration from './pages/RequestModeration';
import DisputeModeration from './pages/DisputeModeration';
import OnBehalfCreation from './pages/OnBehalfCreation';
import CertificateManagement from './pages/CertificateManagement';
import ViewCertificate from './pages/ViewCertificate';
import BroadcastPanel from './pages/BroadcastPanel';
import PushNotifications from './pages/PushNotifications';
import SystemSettings from './pages/SystemSettings';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main Admin Layout Wrapper
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-active' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} theme={theme} setTheme={setTheme} />
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
      )}
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} theme={theme} setTheme={setTheme} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Panel Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserDirectory />} />
          <Route path="partners" element={<PartnerDirectory />} />
          <Route path="partners/add" element={<AddOrganization />} />
          <Route path="requests" element={<RequestModeration />} />
          <Route path="disputes" element={<DisputeModeration />} />
          <Route path="on-behalf" element={<OnBehalfCreation />} />
          <Route path="certificates" element={<CertificateManagement />} />
          <Route path="certificates/view/:id" element={<ViewCertificate />} />
          <Route path="broadcasts" element={<BroadcastPanel />} />
          <Route path="push-notifications" element={<PushNotifications />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        {/* Fallback to Dashboard/Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
