import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Lock, Eye, Smartphone, Globe, Database, UserCheck, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { settingsAPI } from '../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Security Settings
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    loginNotifications: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    reportAlerts: true,
    systemAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'admin-only',
    activityLogging: true,
    dataRetention: 365,
    
    // System Settings
    autoBackup: true,
    maintenanceMode: false,
    debugMode: false,
    cacheSize: '500MB'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsData = await settingsAPI.getAll();
        // Transform API settings to match our local state structure
        const transformedSettings = { ...settings };
        
        settingsData.forEach(setting => {
          if (transformedSettings.hasOwnProperty(setting.key)) {
            transformedSettings[setting.key] = setting.value;
          }
        });
        
        setSettings(transformedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Save each setting individually
      const settingPromises = Object.entries(settings).map(([key, value]) => 
        settingsAPI.update(key, value)
      );
      
      await Promise.all(settingPromises);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-100">
        <Navbar 
          title="Admin Settings"
          subtitle="Configure system preferences and security"
          icon={Settings}
        />
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="text-blue-600" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectField = ({ label, value, onChange, options, description }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-800 mb-1">{label}</label>
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const NumberField = ({ label, value, onChange, min, max, unit, description }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-800 mb-1">{label}</label>
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {unit && <span className="text-gray-600">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-gray-100">
      <Navbar 
        title="Admin Settings"
        subtitle="Manage system and account preferences"
        icon={Settings}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Settings */}
          <SettingsSection title="Security & Access" icon={Shield}>
            <div className="space-y-1">
              <ToggleSwitch
                enabled={settings.twoFactorAuth}
                onChange={(value) => handleSettingChange('twoFactorAuth', value)}
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
              />
              
              <NumberField
                label="Password Expiry"
                value={settings.passwordExpiry}
                onChange={(value) => handleSettingChange('passwordExpiry', value)}
                min={30}
                max={365}
                unit="days"
                description="How often users must change passwords"
              />
              
              <NumberField
                label="Session Timeout"
                value={settings.sessionTimeout}
                onChange={(value) => handleSettingChange('sessionTimeout', value)}
                min={5}
                max={120}
                unit="minutes"
                description="Auto logout after inactivity"
              />
              
              <ToggleSwitch
                enabled={settings.loginNotifications}
                onChange={(value) => handleSettingChange('loginNotifications', value)}
                label="Login Notifications"
                description="Get notified of account access"
              />
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title="Notifications" icon={Bell}>
            <div className="space-y-1">
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onChange={(value) => handleSettingChange('emailNotifications', value)}
                label="Email Notifications"
                description="Receive updates via email"
              />
              
              <ToggleSwitch
                enabled={settings.pushNotifications}
                onChange={(value) => handleSettingChange('pushNotifications', value)}
                label="Push Notifications"
                description="Browser and mobile notifications"
              />
              
              <ToggleSwitch
                enabled={settings.reportAlerts}
                onChange={(value) => handleSettingChange('reportAlerts', value)}
                label="Report Alerts"
                description="Immediate alerts for urgent reports"
              />
              
              <ToggleSwitch
                enabled={settings.systemAlerts}
                onChange={(value) => handleSettingChange('systemAlerts', value)}
                label="System Alerts"
                description="Infrastructure and system notifications"
              />
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection title="Privacy & Data" icon={Eye}>
            <div className="space-y-1">
              <SelectField
                label="Profile Visibility"
                value={settings.profileVisibility}
                onChange={(value) => handleSettingChange('profileVisibility', value)}
                options={[
                  { value: 'admin-only', label: 'Admin Only' },
                  { value: 'internal', label: 'Internal Team' },
                  { value: 'public', label: 'Public' }
                ]}
                description="Who can view your profile information"
              />
              
              <ToggleSwitch
                enabled={settings.activityLogging}
                onChange={(value) => handleSettingChange('activityLogging', value)}
                label="Activity Logging"
                description="Log admin actions for audit trail"
              />
              
              <NumberField
                label="Data Retention"
                value={settings.dataRetention}
                onChange={(value) => handleSettingChange('dataRetention', value)}
                min={30}
                max={2555}
                unit="days"
                description="How long to keep user data"
              />
            </div>
          </SettingsSection>

          {/* System Settings */}
          <SettingsSection title="System Configuration" icon={Database}>
            <div className="space-y-1">
              <ToggleSwitch
                enabled={settings.autoBackup}
                onChange={(value) => handleSettingChange('autoBackup', value)}
                label="Automatic Backups"
                description="Regular system backups"
              />
              
              <ToggleSwitch
                enabled={settings.maintenanceMode}
                onChange={(value) => handleSettingChange('maintenanceMode', value)}
                label="Maintenance Mode"
                description="Temporarily disable user access"
              />
              
              <ToggleSwitch
                enabled={settings.debugMode}
                onChange={(value) => handleSettingChange('debugMode', value)}
                label="Debug Mode"
                description="Enable detailed error logging"
              />
              
              <SelectField
                label="Cache Size"
                value={settings.cacheSize}
                onChange={(value) => handleSettingChange('cacheSize', value)}
                options={[
                  { value: '100MB', label: '100 MB' },
                  { value: '500MB', label: '500 MB' },
                  { value: '1GB', label: '1 GB' },
                  { value: '2GB', label: '2 GB' }
                ]}
                description="System cache allocation"
              />
            </div>
          </SettingsSection>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
          </div>
          <p className="text-red-700 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Reset All Settings
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Clear All Data
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
