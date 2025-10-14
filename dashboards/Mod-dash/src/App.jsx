import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ModeratorManagement from './pages/Moderator_Management';
import ReportManagement from './pages/Report_management';
import Analytics from './pages/Analytics';
import AdminProfile from './pages/AdminProfile';
import AdminSettings from './pages/AdminSettings';
import ReviewVerification from './pages/ReviewVerification';
import BadgeManagement from './pages/BadgeManagement';
import TrustAndSafety from './pages/TrustAndSafety';
import FraudDetection from './pages/FraudDetection';
import DomainManagement from './pages/DomainManagement';
import ExceptionalReviews from './components/ExceptionalReviews';
import './index.css';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isAuthenticated } = useAuth();

  const DashboardLayout = ({ children }) => (
    <div className="min-h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {children}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/review-verification" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ReviewVerification />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BadgeManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/fraud" element={
        <ProtectedRoute>
          <DashboardLayout>
            <FraudDetection />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/badge-management" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BadgeManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/trust-safety" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TrustAndSafety />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/fraud-detection" element={
        <ProtectedRoute>
          <DashboardLayout>
            <FraudDetection />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/moderator" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ModeratorManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/report" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ReportManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/domain-management" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DomainManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/exceptional-reviews" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ExceptionalReviews />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AdminProfile />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AdminSettings />
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
