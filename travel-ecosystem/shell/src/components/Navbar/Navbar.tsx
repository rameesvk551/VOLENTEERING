import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const navItems = [
    { path: '/travel-hub', label: 'Travel Hub' },
    { path: '/visa-explorer', label: 'Visa Explorer' },
    { path: '/trip-planner', label: 'Trip Planner' },
    { path: '/blog', label: 'Blog' },
    { path: '/volunteering', label: 'Volunteering' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex items-center space-x-2 ml-2 md:ml-0">
              <span className="text-2xl">🌍</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Travel Ecosystem
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
