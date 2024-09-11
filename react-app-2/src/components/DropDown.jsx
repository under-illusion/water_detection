import React, { useState, useEffect, useRef } from 'react';

const Dropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="inline-block text-left w-32 ">
      <span className="text-sm font-medium">
        Select Metric:
      </span>
      <button
        type="button"
        className="flex justify-between items-center rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
        onClick={handleToggle}
      >
        {value}
      </button>
      {isOpen && (
        <ul className="absolute mt-2 z-5 bg-white rounded-md shadow-md w-32">
          {options.map((option) => (
            <li
              key={option}
              className="hover:bg-gray-100 p-2 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option.replace("_", " ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
