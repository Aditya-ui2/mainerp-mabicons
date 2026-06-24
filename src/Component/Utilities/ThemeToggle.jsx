import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from "@material-tailwind/react";
import { FaSun, FaMoon } from 'react-icons/fa';

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const TooltipContent = () => (
    <div className="flex items-center space-x-2 p-1">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded ${!darkMode ? 'bg-yellow-200' : ''}`}>
        <FaSun className={`${!darkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
        <span className={`${!darkMode ? 'text-yellow-700 font-medium' : 'text-gray-300'}`}>Light</span>
      </div>
      <span className="text-gray-400">|</span>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded ${darkMode ? 'bg-blue-900' : ''}`}>
        <FaMoon className={`${darkMode ? 'text-blue-300' : 'text-gray-400'}`} />
        <span className={`${darkMode ? 'text-blue-100 font-medium' : 'text-gray-300'}`}>Dark</span>
      </div>
    </div>
  );

  return (
    <Tooltip
      content={<TooltipContent />}
      animate={{
        mount: { scale: 1, y: 0 },
        unmount: { scale: 0, y: 25 },
      }}
    >
      <motion.div
        className="relative inline-block w-12 h-6 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDarkMode}
      >
        <motion.div
          className={`absolute w-full h-full rounded-full transition-colors duration-300 ease-in-out ${
            darkMode ? 'bg-white' : 'bg-black'
          }`}
        />
        <motion.div
          className={`absolute w-5 h-5 rounded-full transition-colors duration-300 ease-in-out ${
            darkMode ? 'bg-black' : 'bg-white'
          }`}
          initial={false}
          animate={{
            x: darkMode ? 26 : 2,
            y: 2
          }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 30
          }}
        />
        <span className="sr-only">Toggle theme</span>
      </motion.div>
    </Tooltip>
  );
}

export default ThemeToggle;