import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import AccountSettings from '../Setting/AccountSettings';
import ThemeSelector from '../Setting/ThemeSelector';
import PrivacySettings from '../Setting/PrivacySettings';
import NotificationSettings from '../Setting/NotificationSettings';

const Setting = () => {
  // State management
  const [currentTheme, setCurrentTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reviewVisibility, setReviewVisibility] = useState('public');
  const [isSaving, setIsSaving] = useState(false);

  // Apply theme to cards
  useEffect(() => {
    const themes = {
      light: { classes: 'bg-gradient-to-br blue-50  text-gray-900' },
      dark: { classes: 'bg-gradient-to-br from-gray-900 to-blue-900 text-white' }
    };
    const root = document.documentElement;
    root.className = `${themes[currentTheme].classes} transition-all duration-300`;
  }, [currentTheme]);

  // Theme configurations
  const themes = {
    light: {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-blue-900',
      section: 'bg-white/80 backdrop-blur-sm',
      text: 'text-gray-800',
      subtext: 'text-gray-600',
      button: 'bg-blue-600 hover:blue-900 ',
      input: 'bg-white border border-gray-300 text-gray-900 focus:border-blue-500',
      toggle: 'bg-blue-600'
    },
    dark: {
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900',
      section: 'bg-gray-800/80 backdrop-blur-sm border-gray-700',
      text: 'text-white',
      subtext: 'text-gray-300',
      button: 'bg-blue-600 hover:blue-900',
      input: 'bg-gray-700 border border-gray-600 text-white focus:border-blue-500',
      toggle: 'bg-blue-600'
    }
  };

  const getThemeClasses = () => themes[currentTheme] || themes.light;

  const themeClasses = getThemeClasses();

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  // Handle save all settings
  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 transition-all duration-300">
      <div className={`max-w-4xl mx-auto ${themeClasses.container} rounded-3xl border shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`${themeClasses.section} p-8 text-center border-b`}>
          <div className="flex items-center justify-center mb-4">
            <Settings className={`w-12 h-12 ${themeClasses.text} mr-4`} />
            <h1 className={`text-4xl font-bold ${themeClasses.text}`}>Settings</h1>
          </div>
          <p className={`text-lg ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Customize your experience and manage your account preferences
          </p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Theme Section */}
          <ThemeSelector 
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            themeClasses={themeClasses}
          />

          {/* Account Section */}
          <AccountSettings themeClasses={themeClasses} />

          {/* Privacy & Security Section */}
          <PrivacySettings 
            reviewVisibility={reviewVisibility}
            onReviewVisibilityChange={setReviewVisibility}
            themeClasses={themeClasses}
          />

          {/* Notifications Section */}
          <NotificationSettings 
            notificationsEnabled={notificationsEnabled}
            onNotificationsChange={setNotificationsEnabled}
            themeClasses={themeClasses}
          />

          {/* Save Section */}
          <div className="text-center p-8">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`
                px-12 py-4 ${themeClasses.button} text-white rounded-2xl font-semibold text-lg
                transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 
                focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]
              `}
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Saving Changes...
                </div>
              ) : (
                'Save All Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;