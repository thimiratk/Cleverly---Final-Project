// src/components/Layout/RightSidebar.jsx
import React from "react";
import Aron from "../../assets/aron.png";
import Elin from "../../assets/elin.jpg";
import Gail from "../../assets/gail.jpg";
import Selena from "../../assets/selena.jpg";

const RightSidebar = () => {
  const categories = [
    "Smart Phones",
    "Desk light",
    "Laptops", 
    "Cycling",
    "Novels",
    "Bags",
    "Parts",
    "Skin care"
  ];

  const people = [
    { name: "Arona Cena", avatar: [Aron] },
    { name: "Elin Rusak", avatar: [Elin] },
    { name: "Gail Godot", avatar: [Gail] },
    { name: "Seleena Gomez", avatar: [Selena] },
  ];

  return (
    <div className="space-y-6">
      {/* Popular Categories */}
      <div className="bg-gradient-to-b from-yellow-100 to-cyan-200 rounded-2xl p-4 h-fit">
        <h3 className="font-semibold text-gray-800 mb-4">Popular Categories</h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition-colors py-1"
            >
              {category}
            </div>
          ))}
        </div>
      </div>

      {/* Active People */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Active People</h3>
        <div className="space-y-3">
          {people.map((person, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                <img 
                  src={person.avatar} 
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                {person.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-2 border-t border-gray-100">
          <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
            See all...
          </span>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;