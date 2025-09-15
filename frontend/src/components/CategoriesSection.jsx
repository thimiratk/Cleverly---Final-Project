import React from "react";

const categories = [
  { name: "Technology", color: "bg-blue-100 text-blue-700" },
  { name: "Phones", color: "bg-green-100 text-green-700" },
  { name: "Laptops", color: "bg-purple-100 text-purple-700" },
  { name: "Home", color: "bg-yellow-100 text-yellow-700" },
  { name: "Fashion", color: "bg-pink-100 text-pink-700" },
  { name: "Automotive", color: "bg-orange-100 text-orange-700" },
  { name: "Food", color: "bg-red-100 text-red-700" },
  { name: "Travel", color: "bg-teal-100 text-teal-700" },
];

export default function CategoriesSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <span
            key={cat.name}
            className={`px-4 py-2 rounded-full font-medium text-sm cursor-pointer hover:shadow-md transition ${cat.color} hover:bg-opacity-80`}
          >
            {cat.name}
          </span>
        ))}
      </div>
    </div>
  );
}
