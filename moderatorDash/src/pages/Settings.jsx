import { Settings as SettingsIcon, Bell, Shield, Database } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">API Configuration</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule-based API URL
              </label>
              <input
                type="text"
                value="http://localhost:8001"
                className="input"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ML API URL
              </label>
              <input
                type="text"
                value="http://localhost:8002"
                className="input"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sentiment API URL
              </label>
              <input
                type="text"
                value="http://localhost:8003"
                className="input"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Fraud detection alerts</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm text-gray-700">Negative sentiment alerts</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">User activity alerts</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fraud Detection Threshold
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">Current: 70%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-block threshold
              </label>
              <select className="input">
                <option>5 fraudulent posts</option>
                <option>10 fraudulent posts</option>
                <option>15 fraudulent posts</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
