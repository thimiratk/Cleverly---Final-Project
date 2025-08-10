import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Sidebar from '../../components/Layout/Sidebar';
import RightSidebar from '../../components/Layout/RightSidebar';

const AppLayout = () => {
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-4 min-h-screen">
      {/* Header */}
      <div className="col-span-5">
        <Header />
      </div>

      {/* Sidebar */}
      <div className="row-span-4 row-start-2">
        <Sidebar />
      </div>

      {/* Main Content: Use Outlet to load Home/Login/SignUp pages here */}
      <div className="col-span-3 row-span-4 row-start-2">
        <Outlet />
      </div>

      {/* Right Sidebar */}
      <div className="row-span-4 col-start-5 row-start-2">
        <RightSidebar />
      </div>
    </div>
  );
};

export default AppLayout;
