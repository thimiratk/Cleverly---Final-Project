import React from "react";

// Dummy stories data
const stories = [
  {
    id: 1,
    name: "Alex",
    avatar: "/src/assets/aron.png",
  },
  {
    id: 2,
    name: "Sarah",
    avatar: "/src/assets/selena.jpg",
  },
  {
    id: 3,
    name: "John",
    avatar: "/src/assets/profile.png",
  },
  {
    id: 4,
    name: "Gail",
    avatar: "/src/assets/gail.jpg",
  },
  {
    id: 5,
    name: "Elin",
    avatar: "/src/assets/Elin.jpg",
  },
];

export default function StoriesSection() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center min-w-[72px]"
        >
          <div className="w-16 h-16 rounded-full border-2 border-sky-500 p-1 bg-white shadow-md">
            <img
              src={story.avatar}
              alt={story.name}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="mt-2 text-xs text-gray-700 font-medium truncate w-16 text-center">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}
