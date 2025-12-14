import React from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { cn } from '../design-system';

/* ========================================
   MAIN LAYOUT
   Base layout wrapper for all pages
   ======================================== */

interface MainLayoutProps {
  children: React.ReactNode;
  transparentHeader?: boolean;
  hideFooter?: boolean;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  transparentHeader = false,
  hideFooter = false,
  className,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent={transparentHeader} />
      
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

/* ========================================
   DASHBOARD LAYOUT
   Layout for user/host dashboards
   ======================================== */

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
  breadcrumbs?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  title,
  breadcrumbs,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container py-6">
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        
        {title && (
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {sidebar && (
            <aside className="w-full lg:w-64 shrink-0">
              {sidebar}
            </aside>
          )}
          
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
