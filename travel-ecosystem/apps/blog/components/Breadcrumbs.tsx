/**
 * Breadcrumbs Component
 * Purpose: Navigation breadcrumbs for page hierarchy
 * Architecture: Accessible navigation component
 */

import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 dark:text-gray-400">
      <ol className="flex flex-wrap items-center gap-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-current={index === items.length - 1 ? 'page' : undefined}
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </a>
            ) : (
              <span className="font-medium text-gray-900 dark:text-gray-100" itemProp="name">
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={(index + 1).toString()} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;