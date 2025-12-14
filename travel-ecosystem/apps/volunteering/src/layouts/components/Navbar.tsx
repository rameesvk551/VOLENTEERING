import React from 'react';
import { cn } from '../../design-system';

/* ========================================
   HEADER/NAVBAR COMPONENT
   Airbnb-inspired navigation header
   ======================================== */

interface NavbarProps {
  transparent?: boolean;
  sticky?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparent = false, sticky = true }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showBackground = !transparent || isScrolled;

  return (
    <header
      className={cn(
        'w-full z-40 transition-all duration-300',
        sticky && 'sticky top-0',
        showBackground ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Volun<span className="text-primary-500">Travel</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/explore">Explore</NavLink>
            <NavLink href="/how-it-works">How It Works</NavLink>
            <NavLink href="/hosts">For Hosts</NavLink>
            <NavLink href="/blog">Blog</NavLink>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Become a Host CTA */}
            <a
              href="/host/signup"
              className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              Become a Host
            </a>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  'flex items-center gap-3 p-1.5 pl-3 border rounded-full',
                  'hover:shadow-md transition-all duration-200',
                  showBackground ? 'border-gray-200 bg-white' : 'border-white/30 bg-white/10'
                )}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in-down">
            <div className="flex flex-col gap-1">
              <MobileNavLink href="/explore">Explore Opportunities</MobileNavLink>
              <MobileNavLink href="/how-it-works">How It Works</MobileNavLink>
              <MobileNavLink href="/hosts">For Hosts</MobileNavLink>
              <MobileNavLink href="/blog">Blog</MobileNavLink>
              <div className="my-2 border-t border-gray-100" />
              <MobileNavLink href="/login">Log in</MobileNavLink>
              <MobileNavLink href="/signup" primary>Sign up</MobileNavLink>
              <MobileNavLink href="/host/signup">Become a Host</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/* Navigation Link */
const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
  >
    {children}
  </a>
);

/* Mobile Navigation Link */
const MobileNavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}> = ({ href, children, primary }) => (
  <a
    href={href}
    className={cn(
      'px-4 py-3 text-base font-medium rounded-lg transition-colors',
      primary
        ? 'bg-primary-500 text-white hover:bg-primary-600'
        : 'text-gray-700 hover:bg-gray-50'
    )}
  >
    {children}
  </a>
);

export default Navbar;
