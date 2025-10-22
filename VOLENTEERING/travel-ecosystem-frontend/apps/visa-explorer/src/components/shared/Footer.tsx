/**
 * Footer Component
 * Purpose: Site footer with links and information
 * Architecture: Consistent styling with blog theme
 */

import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              Visa Explore
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Explore visa requirements and travel information for destinations worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/explore" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Explore
                </a>
              </li>
              <li>
                <a href="/compare" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Compare
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Contact/Social */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
              Connect
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Stay updated with the latest visa information and travel tips.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Visa Explore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;