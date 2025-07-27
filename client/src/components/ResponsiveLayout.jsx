import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import MobileNavigation from './MobileNavigation';
import Navbar from './Navbar';

const ResponsiveLayout = ({ children }) => {
  const { user } = useAuth();
  const { getCartItemsCount } = useCart();

  const userRole = user?.role || 'customer';
  const cartItemCount = getCartItemsCount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation 
          userRole={userRole}
          cartItemCount={cartItemCount}
          notifications={0}
        />
      </div>

      {/* Main Content */}
      <main className="lg:container lg:mx-auto lg:px-4">
        {children}
      </main>
    </div>
  );
};

export default ResponsiveLayout;