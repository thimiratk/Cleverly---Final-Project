import React from 'react';
import { MoreHorizontal, Heart, MessageCircle, Share } from 'lucide-react';

const MainPost = () => (
  <div className="bg-white rounded-2xl p-6 mb-6">
    {/* Post Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">ЯЯ</span>
        </div>
        <div>
          <div className="font-medium text-gray-800">Mirna Agency</div>
          <div className="text-sm text-gray-500">Creative Agency, local education</div>
        </div>
      </div>
      <button>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </button>
    </div>

    {/* Post Content */}
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        A creative agency that creates creative designs and websites for you
      </h3>

      {/* Images Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl p-6 relative overflow-hidden">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="h-1 bg-gray-700 rounded flex-1"></div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">+</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 rounded-xl p-4 h-32">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Dashboard</span>
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              <div className="h-2 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 h-32">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-300 rounded w-16"></div>
                <div className="h-1 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
            <div className="bg-blue-600 rounded p-2">
              <div className="h-12 bg-blue-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Post Engagement */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-gray-600">
          <Heart className="w-5 h-5" />
          <span className="text-sm">3K</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">300</span>
        </div>
        <Share className="w-5 h-5 text-gray-600" />
      </div>

      <button className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
        Visit Site
      </button>
    </div>

    {/* Post Footer */}
    <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
      <div className="flex -space-x-2 mr-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
        ))}
      </div>
      <span className="text-sm text-gray-500">
        Liked by <strong>susilo.ifta</strong> and <strong>1950 others</strong>
      </span>
    </div>
  </div>
);

export default MainPost;
