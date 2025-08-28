import React, { useState} from 'react';
import Header from '../../components/Layout/Header';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockFollowers = [
  {
    id: '1',
    name: 'Nimesh Perera',
    role: 'Electronic Expert',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
  {
    id: '2',
    name: 'Piyal de Silvs',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
  {
    id: '3',
    name: 'Akila Deshan',
    role: 'Electronic Expert',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
  {
    id: '4',
    name: 'Nishan Kariyawasam',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
    {
    id: '5',
    name: 'Akila Deshan',
    role: 'Electronic Expert',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
  {
    id: '6',
    name: 'Sadun Geshan',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
    {
    id: '7',
    name: 'Gihan Fernando',
    role: 'Electronic Expert',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
  {
    id: '8',
    name: 'Dewnaka Nelson',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
    {
    id: '9',
    name: 'Nadun Perera',
    role: 'Electronic Expert',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
  {
    id: '10',
    name: 'Asela Peris',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    isFollowed: true,
  },
];

const FollowersList = () => {

  const navigate = useNavigate();  //nandle navigation
  const [followers, setFollowers] = useState(mockFollowers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFollowers = followers.filter(follower =>
    follower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    follower.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFollow = (id) => {
    setFollowers(prev =>
      prev.map(follower =>
        follower.id === id
          ? { ...follower, isFollowed: !follower.isFollowed }
          : follower
      )
    );
  };

  return (
    <div className="p-4">
      <Header />

      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-900">Followers</h2>
            {/* Optional close button if you want to navigate away */}
            <button onClick={()=>navigate('/')}>
            <X className="w-5 h-5 text-gray-500 cursor-pointer" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Followers List */}
          <div className="px-6 pb-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {filteredFollowers.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between group">
                  <div className="flex items-center space-x-3 flex-1">
                    <img
                      src={follower.avatar}
                      alt={follower.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {follower.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {follower.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFollow(follower.id)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                      follower.isFollowed
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
                    }`}
                  >
                    {follower.isFollowed ? 'Followed' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>

            {filteredFollowers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No followers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FollowersList;