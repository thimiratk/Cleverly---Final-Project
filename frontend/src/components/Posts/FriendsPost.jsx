import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const FriendsPost = () => {
  const posts = [
    {
      id: 1,
      username: 'Jane Doe',
      userImage: 'https://via.placeholder.com/40',
      postImage: 'https://via.placeholder.com/500x300',
      caption: 'Exploring the beautiful hills!',
    },
    {
      id: 2,
      username: 'John Smith',
      userImage: 'https://via.placeholder.com/40',
      postImage: 'https://via.placeholder.com/500x300',
      caption: 'Loving this new gadget I got!',
    },
  ];

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <img src={post.userImage} alt={post.username} className="w-10 h-10 rounded-full" />
            <span className="font-semibold">{post.username}</span>
          </div>
          <img src={post.postImage} alt="Post" className="w-full rounded-lg mb-4" />
          <p className="mb-3 text-gray-700">{post.caption}</p>
          <div className="flex space-x-6 text-gray-600">
            <button className="flex items-center space-x-1 hover:text-red-500">
              <Heart className="w-5 h-5" />
              <span>Like</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500">
              <MessageCircle className="w-5 h-5" />
              <span>Comment</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-green-500">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsPost;
