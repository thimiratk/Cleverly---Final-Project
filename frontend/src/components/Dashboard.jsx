// src/components/Posts/Dashboard.jsx
import React from "react";
import CreatePost from "./Posts/CreatePost";
import PostCard from "../components/PostCard";
import Phone1 from "../assets/posts/Phone1.jpg";
import Phone2 from "../assets/posts/Phone2.png";
import Phone3 from "../assets/posts/Phone3.png";
import Laptop from "../assets/posts/laptop.jpg";
import Audi from "../assets/posts/audi.png";
import Elin from "./../assets/elin.jpg";


const Dashboard = () => {
  // Example posts data
  const posts = [
      {
      id: 1,
      profileImage: Elin, 
      author: "A Walker",
      text: "I finally bought the Audi RS7, and honestly, it feels like one of the biggest achievements of my life. From the moment I stepped into the cockpit, I knew this wasn't just another car.",
      images: [Audi],
      likes: "5K",
      rating: 4.2,
      reviews: "99.9K",
    },
    {
      id: 2,
      author: "MJ Paige",
      text: "I've been using the Samsung S24 for a few days now, and honestly, it feels like a solid upgrade. The screen is stunning — super smooth and bright, and it just feels premium in the hand. See more...",
      images: [
        Phone1,
        Phone2, 
        Phone3,
        Laptop
      ],
      upvotes: "5K",
      downvotes: "2K",
      rating: 4.2,
      comments: "99.9K",
    },
    {
      id: 3,
      author: "A Walker",
      text: "I finally bought the Audi RS7, and honestly, it feels like one of the biggest achievements of my life. From the moment I stepped into the cockpit, I knew this wasn't just another car.",
      images: [Audi],
      upvotes: "5K",
      downvotes: "2K",
      rating: 4.2,
      comments: "99.9K",
    },

  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Create Post Component */}
      <CreatePost />
      
      {/* Posts Feed */}
      {posts.map((post) => (
        <PostCard key={`${post.id}-${post.time}`} {...post} />
      ))}
    </div>
  );
};


export default Dashboard;