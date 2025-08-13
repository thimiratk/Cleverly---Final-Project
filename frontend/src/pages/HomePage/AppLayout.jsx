// src/pages/HomePage/AppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Layout/Header";
import Sidebar from "../../components/Layout/Sidebar";
import RightSidebar from "../../components/Layout/RightSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-72 sticky top-6 self-start">
            <Sidebar />
          </aside>
          
          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <Outlet />
          </section>
          
          {/* Right Sidebar */}
          <aside className="hidden lg:block w-72 sticky top-10 self-start">
            <RightSidebar />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;