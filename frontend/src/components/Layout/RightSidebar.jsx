import React from 'react';
import { UserPlus } from 'lucide-react';

const RightSidebar = () => {
  const suggestions = [
    { name: 'User One', image: 'https://via.placeholder.com/40' },
    { name: 'User Two', image: 'https://via.placeholder.com/40' },
    { name: 'User Three', image: 'https://via.placeholder.com/40' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Suggested Friends</h2>
      <ul className="space-y-3">
        {suggestions.map((user, index) => (
          <li key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
              <span className="font-medium">{user.name}</span>
            </div>
            <button className="flex items-center space-x-1 text-sm text-blue-600 hover:underline">
              <UserPlus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RightSidebar;
