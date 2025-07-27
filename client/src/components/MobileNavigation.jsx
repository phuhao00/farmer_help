import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  User, 
  Menu, 
  X,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const MobileNavigation = ({ userRole, cartItemCount = 0, notifications = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const customerNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/products', icon: Search, label: 'Browse' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItemCount },
    { path: '/orders', icon: Package, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const farmerNavItems = [
    { path: '/farmer/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/farmer/products', icon: Package, label: 'Products' },
    { path: '/farmer/orders', icon: ShoppingCart, label: 'Orders', badge: notifications },
    { path: '/farmer/profile', icon: User, label: 'Profile' },
    { path: '/farmer/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = userRole === 'farmer' ? farmerNavItems : customerNavItems;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-green-600">
                      Farm Fresh
                    </h2>
                    <p className="text-sm text-gray-600 capitalize">
                      {userRole} Dashboard
                    </p>
                  </div>
                  
                  <nav className="flex-1 py-4">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                            isActive(item.path)
                              ? 'bg-green-50 text-green-600 border-r-2 border-green-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-600">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  
                  <div className="p-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg font-semibold text-green-600">
              Farm Fresh
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {userRole === 'customer' && (
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm" className="p-2">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors ${
                  isActive(item.path)
                    ? 'text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;