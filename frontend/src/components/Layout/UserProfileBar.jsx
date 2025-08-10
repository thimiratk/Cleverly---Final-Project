import React from 'react';
import { User } from 'lucide-react';

const UserProfileBar = () => {
  const users = [
    { name: 'Ali Barber', active: true },
    { name: 'Ali Barber', active: false },
    { name: 'Ali Barber', active: false },
    { name: 'Ali Barber', active: false },
    { name: 'Ali Barber', active: false },
    { name: 'Ali Barber', active: false }
  ];

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {users.map((user, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                user.active ? 'bg-purple-600' : 'bg-gray-300'
              } relative`}>
                <User className={`w-6 h-6 ${user.active ? 'text-white' : 'text-gray-600'}`} />
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-1">{user.name}</span>
            </div>
          ))}
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">ЯЯ</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileBar;
