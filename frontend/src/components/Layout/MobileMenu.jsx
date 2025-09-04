import React from 'react';
import { X } from 'lucide-react';

const MobileMenu = ({ showMobileMenu, setShowMobileMenu, handleNavigation }) => {
  return (
    <>
      {/* Burger button visible only on mobile */}
      <div className="md:hidden">
        <button onClick={() => setShowMobileMenu(true)} title="Open Menu" aria-label="Open Menu">
          <svg className="w-7 h-7 text-white cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu drawer */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-0 right-0 bottom-0 w-72 bg-white shadow-lg z-50">
          <div className="flex justify-end p-6">
            <button onClick={() => setShowMobileMenu(false)} title="Close Menu" aria-label="Close Menu">
              <X className="w-6 h-6 text-gray-700 cursor-pointer" />
            </button>
          </div>
          <nav className="flex flex-col items-start px-6 space-y-4 text-gray-800 font-medium cursor-pointer">
            <a onClick={() => { setShowMobileMenu(false); handleNavigation('/'); }} className="hover:text-blue-600">Home</a>
            <a onClick={() => { setShowMobileMenu(false); handleNavigation('/trendings'); }} className="hover:text-blue-600">Trending</a>
            <a onClick={() => { setShowMobileMenu(false); handleNavigation('/followers'); }} className="hover:text-blue-600">Followers</a>
            <a onClick={() => { setShowMobileMenu(false); handleNavigation('/userprofile'); }} className="hover:text-blue-600">My Profile</a>
            <a onClick={() => { setShowMobileMenu(false); handleNavigation('/settings'); }} className="hover:text-blue-600">Settings</a>
            <a onClick={() => { setShowMobileMenu(false); ;handleNavigation('/login'); }} className="text-red-600 hover:text-red-800">Logout</a>
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
