import React from 'react';
import { useUser } from '../hooks/useUser';

export default function UserDebug() {
  const { user, isLoading, isError } = useUser();

  if (isLoading) return <div className="p-4 bg-blue-100">Loading user...</div>;
  if (isError) return <div className="p-4 bg-red-100">Error loading user</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="font-bold mb-2">User Debug Info:</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Name:</strong> {user?.name || 'N/A'}</div>
        <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
        <div><strong>Profile Picture:</strong> {user?.profilePicture || 'N/A'}</div>
        <div><strong>Avatar:</strong> {user?.avatar || 'N/A'}</div>
        {user?.profilePicture && (
          <div>
            <strong>Profile Picture Preview:</strong>
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mt-2"
              onError={(e) => console.log('Debug: Profile picture failed to load')}
              onLoad={() => console.log('Debug: Profile picture loaded successfully')}
            />
          </div>
        )}
        <div><strong>Full User Object:</strong></div>
        <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}