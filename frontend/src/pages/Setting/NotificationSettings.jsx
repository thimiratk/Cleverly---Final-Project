import React from 'react';
import { Bell } from 'lucide-react';

const NotificationSettings = ({ notificationsEnabled, onNotificationsChange, themeClasses }) => {
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
            onChange={onNotificationsChange}
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
  );
};

export default NotificationSettings;