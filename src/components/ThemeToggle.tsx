import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`p-2 rounded-lg border transition-colors duration-200 
        bg-light-card border-light-border text-light-text hover:bg-mono-200 
        dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:hover:bg-mono-850 
        focus:outline-none focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-white" />
      ) : (
        <Moon className="w-4 h-4 text-black" />
      )}
    </button>
  );
};

