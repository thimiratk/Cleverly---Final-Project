import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Trending");

  const options = ["Trending", "Newest", "Highest Rated", "Most Popular"];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-between w-48 px-4 py-3 bg-gray-100 rounded-lg border text-gray-800"
      >
        {selected}
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selected === option
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
