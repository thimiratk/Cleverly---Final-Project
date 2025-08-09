import React, { useState } from 'react';

const UserPostForm = () => {
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    // You can handle form submission here (e.g., send to API or state)
    console.log('Post submitted:', postText, postImage);
    setPostText('');
    setPostImage(null);
  };

  return (
    <form
      onSubmit={handlePostSubmit}
      className="bg-white p-4 rounded-lg shadow-md mb-6"
    >
      <textarea
        className="w-full border rounded-lg p-2 mb-4 resize-none"
        rows="3"
        placeholder="What's on your mind?"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPostImage(e.target.files[0])}
        className="mb-4"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Post
      </button>
    </form>
  );
};

export default UserPostForm;
