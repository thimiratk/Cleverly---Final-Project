import React, { useState, useEffect } from "react";
import { getCategories } from "../services/api";

const colorPalette = [
  "bg-blue-100 text-blue-700 hover:bg-blue-200",
  "bg-green-100 text-green-700 hover:bg-green-200",
  "bg-purple-100 text-purple-700 hover:bg-purple-200",
  "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  "bg-pink-100 text-pink-700 hover:bg-pink-200",
  "bg-orange-100 text-orange-700 hover:bg-orange-200",
  "bg-red-100 text-red-700 hover:bg-red-200",
  "bg-teal-100 text-teal-700 hover:bg-teal-200",
  "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
];

export default function CategoriesSection({ selectedCategory, onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    // If clicking the same category, deselect it (show all)
    if (selectedCategory === categoryId) {
      onCategorySelect(null);
    } else {
      onCategorySelect(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        {selectedCategory && (
          <button
            onClick={() => onCategorySelect(null)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {categories.map((cat, index) => {
          const isSelected = selectedCategory === cat.id;
          const colorClass = colorPalette[index % colorPalette.length];
          
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm cursor-pointer transition-all transform hover:scale-105 ${
                isSelected
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : colorClass
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
