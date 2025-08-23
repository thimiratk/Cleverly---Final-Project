import React, { useState, useEffect } from 'react';
import { Settings, User, Shield, Bell, Palette, Mail, Lock, Eye, Users, Globe, Moon, Sun, Laptop } from 'lucide-react';
import Alert from '@mui/material/Alert';

const Setting = () => {
  // State management
  const [currentTheme, setCurrentTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reviewVisibility, setReviewVisibility] = useState('public');
  const [email, setEmail] = useState('sewmini@gmail.com'); //old email
  const [newEmail, setNewEmail] = useState("");  // input for new email
  const [newPassword, setNewPassword] = useState("");  // input for new password
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Theme configurations
  const themes = {
    light: {
      name: 'Light',
      icon: Sun,
      classes: 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    },
    dark: {
      name: 'Dark',
      icon: Moon,
      classes: 'bg-gradient-to-br from-gray-900 to-blue-900 text-white'
    },
    system: {
      name: 'System',
      icon: Laptop,
      classes: 'bg-gradient-to-br from-purple-100 to-blue-200 text-gray-900'
    }
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.className = `${themes[currentTheme].classes} transition-all duration-300`;
  }, [currentTheme]);

  // Theme-aware classes
  const getThemeClasses = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          container: 'bg-gray-800/90 backdrop-blur-xl border-gray-700',
          section: 'bg-gray-700/50 border-gray-600',
          input: 'bg-gray-600 border-gray-500 text-white placeholder-gray-300',
          button: 'bg-blue-600 hover:bg-blue-700',
          secondaryButton: 'bg-gray-600 hover:bg-gray-500 text-white',
          text: 'text-white',
          subtext: 'text-gray-300',
          toggle: 'bg-blue-600'
        };
      case 'system':
        return {
          container: 'bg-white/80 backdrop-blur-xl border-purple-200',
          section: 'bg-purple-50/70 border-purple-100',
          input: 'bg-white border-purple-200 text-gray-900',
          button: 'bg-purple-600 hover:bg-purple-700',
          secondaryButton: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          toggle: 'bg-purple-600'
        };
      default: // light
        return {
          container: 'bg-white/90 backdrop-blur-xl border-blue-200',
          section: 'bg-blue-50/70 border-blue-100',
          input: 'bg-white border-blue-200 text-gray-900',
          button: 'bg-blue-600 hover:bg-blue-700',
          secondaryButton: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          toggle: 'bg-blue-600'
        };
    }
  };

  const themeClasses = getThemeClasses();

  // Handle email change
  const handleEmailChange = () => {
    if (!newEmail || !newEmail.includes("@")) { // simple validation
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // auto-hide after 3 sec
      return;
    }
    setIsChangingEmail(true);
    setTimeout(() => {
      setEmail(newEmail);
      setNewEmail('');
      setIsChangingEmail(false);
      setShowSuccess(true);
// Auto-hide alert after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000); // 3000ms = 3 seconds
    }, 1500);
  };


  // Handle password change
  const handlePasswordChange = () => {
    if(!newPassword){
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // auto-hide after 3 sec
      return;
    }
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(newPassword);
      setNewPassword('');
      setIsChangingPassword(false);
      setShowSuccess(true);
      // Auto-hide alert after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000); // 3000ms = 3 seconds
    }, 1500);
  };

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  // Save all settings
  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('🎉 All settings saved successfully!');
    }, 2000);
  };

  // Toggle component
  const Toggle = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`
        relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${enabled ? themeClasses.toggle : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 
          transition duration-200 ease-in-out
          ${enabled ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );

  return (
    <div className="min-h-screen p-4 transition-all duration-300">
      <div className={`max-w-4xl mx-auto ${themeClasses.container} rounded-3xl border shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Settings className="w-12 h-12 text-white mr-4" />
            <h1 className="text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-blue-100 text-lg">Customize your experience and manage your preferences</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Theme Section */}
          <div className={`${themeClasses.section} rounded-2xl p-8 border transition-all duration-200 hover:shadow-lg`}>
            <div className="flex items-center mb-6">
              <Palette className={`w-6 h-6 ${themeClasses.text} mr-3`} />
              <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Theme Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(themes).map(([key, theme]) => {
                const IconComponent = theme.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`
                      p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${currentTheme === key 
                        ? `${themeClasses.button} text-white border-transparent shadow-lg` 
                        : `${themeClasses.secondaryButton} border-gray-200 hover:border-blue-300`
                      }
                    `}
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-3" />
                    <div className="text-lg font-medium">{theme.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Section */}
          <div className={`${themeClasses.section} rounded-2xl p-8 border transition-all duration-200 hover:shadow-lg`}>
            <div className="flex items-center mb-6">
              <User className={`w-6 h-6 ${themeClasses.text} mr-3`} />
              <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Account Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Email Setting */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className={`font-semibold ${themeClasses.text}`}>Email Address</h3>
                    <p className={`text-sm ${themeClasses.subtext}`}>Current: {email}</p>
                    <input
                      type="email"
                      placeholder="Enter new email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={`mt-2 px-3 py-2 ${themeClasses.input} rounded-lg w-full sm:w-72`}
                    />
                  </div>
                </div>
                <button
                  onClick={handleEmailChange}
                  disabled={isChangingEmail}
                  className={`
                    px-6 py-3 ${themeClasses.button} text-white rounded-xl font-medium transition-all duration-200
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]
                  `}
                >
                  {isChangingEmail ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Change Email'
                  )}
                </button>
              </div>

              {/* Success Alert */}
              {showSuccess && (
                <Alert variant="outlined" severity="success"> Updated successfully!</Alert>              
              )}

               {/* Failure Alert */}
                {showError && (
                  <Alert variant="outlined" severity="error">Error</Alert>
                )}
           

              {/* Password Setting */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className={`font-semibold ${themeClasses.text}`}>Password</h3>
                    <p className={`text-sm ${themeClasses.subtext}`}>Keep your account secure</p>
                    <input
                      type="password"
                      placeholder="Enter new Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`mt-2 px-3 py-2 ${themeClasses.input} rounded-lg w-full sm:w-72`}
                    />
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className={`
                    px-6 py-3 ${themeClasses.button} text-white rounded-xl font-medium transition-all duration-200
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]
                  `}
                >
                  {isChangingPassword ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className={`${themeClasses.section} rounded-2xl p-8 border transition-all duration-200 hover:shadow-lg`}>
            <div className="flex items-center mb-6">
              <Shield className={`w-6 h-6 ${themeClasses.text} mr-3`} />
              <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Privacy & Security</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
              <div className="flex items-center space-x-4">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className={`font-semibold ${themeClasses.text}`}>Review Visibility</h3>
                  <p className={`text-sm ${themeClasses.subtext}`}>Control who can see your reviews</p>
                </div>
              </div>
              <select
                value={reviewVisibility}
                onChange={(e) => setReviewVisibility(e.target.value)}
                className={`
                  px-4 py-3 ${themeClasses.input} rounded-l border focus:outline-none focus:ring-2 focus:ring-blue-500
                  focus:border-transparent transition-all duration-200 min-w-[160px]
                `}
              >
                <option value="public">🌍 Public</option>
                <option value="friends">👥 Friends Only</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
          </div>

          {/* Notifications Section */}
          <div className={`${themeClasses.section} rounded-2xl p-8 border transition-all duration-200 hover:shadow-lg`}>
            <div className="flex items-center mb-6">
              <Bell className={`w-6 h-6 ${themeClasses.text} mr-3`} />
              <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Notification Settings</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
                <div>
                  <h3 className={`font-semibold ${themeClasses.text}`}>Push Notifications</h3>
                  <p className={`text-sm ${themeClasses.subtext}`}>Enable or disable all push notifications</p>
                </div>
                <Toggle 
                  enabled={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
                <div>
                  <h3 className={`font-semibold ${themeClasses.text}`}>Customize Preferences</h3>
                  <p className={`text-sm ${themeClasses.subtext}`}>Fine-tune your notification settings</p>
                </div>
                <button
                  className={`
                    px-6 py-3 ${themeClasses.secondaryButton} rounded-xl font-medium transition-all duration-200
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  `}
                  onClick={() => alert('🎛️ Notification preferences:\n\n✅ Email notifications\n✅ Review responses\n✅ Friend requests\n❌ Marketing emails\n❌ Weekly digest')}
                >
                  Customize
                </button>
              </div>
            </div>
          </div>

          {/* Save Section */}
          <div className="text-center p-8">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="
                px-12 py-4 bg-blue-900 text-white text-lg font-bold
                rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              "
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving Changes...
                </div>
              ) : (
                'Save All Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;