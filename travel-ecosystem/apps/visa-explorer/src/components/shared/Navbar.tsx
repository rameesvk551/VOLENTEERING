/**
 * Navbar Component
 * Purpose: Main navigation bar for Visa Explorer
 * Architecture: Responsive navigation with dark mode support
 */

import React from "react";
import { useTheme } from '../../hooks/useTheme';

interface NavItemProps {
  label: string;
  href?: string;
  submenu?: NavItemProps[];
}

const navItems: NavItemProps[] = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Compare", href: "/compare" },
  { label: "Map", href: "/map" },
  { label: "About", href: "/about" },
];

const Navbar: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [search, setSearch] = React.useState("");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search logic
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-xl font-bold text-primary-600 dark:text-primary-400">Visa Explore</div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-200 dark:focus:bg-gray-700 transition-colors"
            >
              {item.label}
            </a>
          ))}

          {/* Search Bar Desktop */}
          <form
            onSubmit={handleSearch}
            className="ml-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-primary transition w-64"
            role="search"
            aria-label="Site search"
          >
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none px-2 py-1 w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Search..."
              aria-label="Search"
            />
            <button
              type="submit"
              className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              aria-label="Submit search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Theme Toggle Button Desktop */}
          <button
            onClick={toggleTheme}
            className="ml-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>

        {/* Mobile Hamburger & Search */}
        <div className="flex md:hidden items-center gap-2">
          {/* Search Bar Mobile */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-primary transition w-32"
            role="search"
            aria-label="Site search"
          >
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none px-2 py-1 w-full text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Search..."
              aria-label="Search"
            />
            <button
              type="submit"
              className="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
              aria-label="Submit search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Theme Toggle Button Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <nav className="max-w-7xl mx-auto px-4 py-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;