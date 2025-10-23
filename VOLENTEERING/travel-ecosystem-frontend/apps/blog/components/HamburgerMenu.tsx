import React, { useState, useRef, useEffect } from "react";
import { NavItem, NavItemProps } from "./NavItem";

export type HamburgerMenuProps = {
  items: NavItemProps[];
  className?: string;
};

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  items,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close menu when a link is clicked
  const handleItemClick = () => setOpen(false);

  return (
    <div className={`md:hidden relative ${className}`}>
      {/* Hamburger Icon */}
      <button
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary transition"
      >
        <span
          className={`block w-6 h-0.5 bg-gray-800 dark:bg-gray-200 mb-1 transition-transform duration-300 ${
            open ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-gray-800 dark:bg-gray-200 mb-1 transition-opacity duration-300 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-gray-800 dark:bg-gray-200 transition-transform duration-300 ${
            open ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="menu"
        aria-label="Mobile navigation"
      >
        <nav className="mt-16 px-4">
          {items.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              onClick={handleItemClick}
              isMobile
            />
          ))}
        </nav>
      </div>
    </div>
  );
};
