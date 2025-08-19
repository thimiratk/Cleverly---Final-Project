import React, { useState, useEffect } from 'react';
import { Settings, Bell, Palette, ChevronDown, Check } from 'lucide-react';

const Setting = () => {
  // Theme state
  const [theme, setTheme] = useState('light');
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState(true);

  // Privacy state
  const [reviewPrivacy, setReviewPrivacy] = useState('Public');
  const [privacyDropdownOpen, setPrivacyDropdownOpen] = useState(false);

  const themeOptions = ['Light', 'Dark'];
  const privacyOptions = ['Public', 'Private', 'Friends'];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme.toLowerCase());
    localStorage.setItem('theme', newTheme.toLowerCase());
    setIsThemeOpen(false);
  };

  const handleChangeEmail = () => {
    alert('Redirecting to change email page...');
  };

  const handleChangePassword = () => {
    alert('Redirecting to change password page...');
  };

  const handleCustomizeNotifications = () => {
    alert('Opening notification preferences...');
  };

  const handleSaveSettings = () => {
    const settings = {
      theme,
      reviewPrivacy,
      notifications: notifications ? 'On' : 'Off',
    };

    alert(
      `Settings saved!\n\nTheme: ${settings.theme}\nReview Privacy: ${settings.reviewPrivacy}\nNotifications: ${settings.notifications}`
    );
  };

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white p-8 rounded-t-xl">
              <div className="flex items-center gap-4 justify-center">
                <div className="p-3 bg-white/20 rounded-full">
                  <Settings className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold mb-2">Settings</h1>
                  <p className="text-blue-100 dark:text-blue-200">Customize your account preferences</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">

              {/* Account Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Email Address</span>
                    <button
                      onClick={handleChangeEmail}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Password</span>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy & Security Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacy & Security</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Who can see my reviews</span>
                    <div className="relative">
                      <button
                        onClick={() => setPrivacyDropdownOpen(!privacyDropdownOpen)}
                        className="flex items-center justify-between w-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        <span className="text-gray-900 dark:text-gray-100">{reviewPrivacy}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${privacyDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {privacyDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                          {privacyOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setReviewPrivacy(option);
                                setPrivacyDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-between transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              {option}
                              {reviewPrivacy === option && <Check className="w-4 h-4 text-blue-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notification Settings</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Notifications</span>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        notifications
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Customize notification preferences</span>
                    <button
                      onClick={handleCustomizeNotifications}
                      className="px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              </div>

              {/* Theme Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Theme</span>
                  <div className="relative">
                    <button
                      onClick={() => setIsThemeOpen(!isThemeOpen)}
                      className="flex items-center justify-between w-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <span className="text-gray-900 dark:text-gray-100">
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isThemeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isThemeOpen && (
                      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                        {themeOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => toggleTheme(option)}
                            className="w-full text-left px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-600 flex items-center justify-between transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                            {theme === option.toLowerCase() && <Check className="w-4 h-4 text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleSaveSettings}
                  className="px-8 py-3 text-lg rounded-lg font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-green-500"
                >
                  Save All Settings
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
