import React from 'react';
import { Shield, Eye } from 'lucide-react';

const PrivacySettings = ({ reviewVisibility, onReviewVisibilityChange, themeClasses }) => {
  return (
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
          onChange={(e) => onReviewVisibilityChange(e.target.value)}
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
  );
};

export default PrivacySettings;