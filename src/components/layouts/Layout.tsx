import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { Outlet, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();

  // Enhanced gradient backgrounds for different routes
  const getBackgroundColor = () => {
    switch (location.pathname) {
      case '/interview':
        return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950';
      case '/settings':
        return 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900';
      case '/reports':
        return 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900';
      default:
        return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundColor()} transition-colors duration-300`}>
      <div className="flex min-h-screen">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile navigation */}
        <div className="lg:hidden">
          <MobileNav />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;