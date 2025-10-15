import React from "react";
import { HamburgerMenu } from "./HamburgerMenu";
import { NavItemProps } from "./NavItem";
import { useTheme } from '../hooks/useTheme';

const navItems: NavItemProps[] = [
  { label: "Blog", href: "/" },
  { label: "Volunteering", href: "/volunteering" },
  {
    label: "Plan Your Trip",
    submenu: [
      { label: "Check Visa", href: "/plan/visa" },
      { label: "Hotel", href: "/plan/hotel" },
      { label: "Flight", href: "/plan/flight" },
      { label: "Tours", href: "/plan/tours" },
    ],
  },
  {
    label: "Categories",
    submenu: [
      { label: "Travel", href: "/categories/travel" },
      { label: "Tips", href: "/categories/tips" },
    ],
  },
  { label: "About", href: "/about" },
];

export const Navbar: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [search, setSearch] = React.useState("");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search logic or navigation
    // Example: window.location.href = `/search?q=${encodeURIComponent(search)}`;
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-xl font-bold text-primary">RAIH</div>
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
          <HamburgerMenu items={navItems} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
