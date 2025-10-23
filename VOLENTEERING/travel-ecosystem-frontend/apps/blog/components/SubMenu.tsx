import React from "react";
import { NavItemProps } from "./NavItem";

export type SubMenuProps = {
  items: NavItemProps[];
  open: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
};

export const SubMenu: React.FC<SubMenuProps> = ({
  items,
  open,
  isMobile = false,
  onItemClick,
}) => {
  if (!open) return null;

  return (
    <div
      className={`pl-6 mt-1 space-y-1 ${
        isMobile
          ? ""
          : "absolute left-full top-0 bg-white dark:bg-gray-900 shadow-lg rounded"
      }`}
      role="menu"
      aria-label="Submenu"
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="block px-4 py-2 rounded text-base font-normal transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-200 dark:focus:bg-gray-700 active:bg-primary/10 focus:outline-none"
          onClick={onItemClick}
          tabIndex={0}
          aria-label={item.label}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </a>
      ))}
    </div>
  );
};
