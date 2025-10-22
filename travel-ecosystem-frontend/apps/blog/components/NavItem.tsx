import React, { useState } from "react";
import { SubMenu, SubMenuProps } from "./SubMenu";

export type NavItemProps = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  submenu?: SubMenuProps["items"];
  onClick?: () => void;
  isMobile?: boolean;
};

export const NavItem: React.FC<NavItemProps> = ({
  label,
  href,
  icon,
  submenu,
  onClick,
  isMobile = false,
}) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

  // Toggle submenu for mobile
  const handleSubmenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setSubmenuOpen((prev) => !prev);
  };

  const baseClasses =
    "flex items-center px-4 py-3 rounded text-lg font-medium transition-colors cursor-pointer " +
    "hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-200 dark:focus:bg-gray-700 active:bg-primary/10 " +
    "focus:outline-none";

  if (submenu) {
    return (
      <div className="relative">
        <button
          className={baseClasses + " w-full justify-between"}
          aria-haspopup="true"
          aria-expanded={submenuOpen}
          onClick={isMobile ? handleSubmenuToggle : undefined}
          tabIndex={0}
        >
          <span className="flex items-center gap-2">
            {icon}
            {label}
          </span>
          {/* Disclosure Arrow */}
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${
              submenuOpen ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        {/* Nested SubMenu */}
        <SubMenu
          items={submenu}
          open={submenuOpen}
          isMobile={isMobile}
          onItemClick={onClick}
        />
      </div>
    );
  }

  return (
    <a
      href={href}
      className={baseClasses}
      onClick={onClick}
      tabIndex={0}
      aria-label={label}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </a>
  );
};
