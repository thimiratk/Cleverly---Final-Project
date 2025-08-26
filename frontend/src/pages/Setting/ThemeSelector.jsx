import React from 'react';
import { Palette, Sun, Moon } from 'lucide-react';

const ThemeSelector = ({ currentTheme, onThemeChange, themeClasses }) => {
  const themes = {
    light: { name: 'Light', icon: Sun },
    dark: { name: 'Dark', icon: Moon }
  };

  return (
    <div className={`${themeClasses.section} rounded-2xl p-8 border transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center mb-6">
        <Palette className={`w-6 h-6 ${themeClasses.text} mr-3`} />
        <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Theme Preferences</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {Object.entries(themes).map(([key, theme]) => {
          const IconComponent = theme.icon;
          return (
            <button
              key={key}
              onClick={() => onThemeChange(key)}
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
  );
};

export default ThemeSelector;