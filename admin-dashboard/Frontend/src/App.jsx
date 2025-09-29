import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import './index.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="min-h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/review-verification" element={<ReviewVerification />} />
          <Route path="/users" element={<BadgeManagement />} />
          <Route path="/fraud" element={<FraudDetection />} />
          <Route path="/badge-management" element={<BadgeManagement />} />
          <Route path="/trust-safety" element={<TrustAndSafety />} />
          <Route path="/fraud-detection" element={<FraudDetection />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/moderator" element={<ModeratorManagement />} />
          <Route path="/report" element={<ReportManagement />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
