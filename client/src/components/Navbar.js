import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-green-600">
            FarmMarket
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-green-600">
              Products
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-green-600">
              Marketplace
            </Link>
            <Link to="/farmers" className="text-gray-600 hover:text-green-600">
              Farmers
            </Link>

            {user ? (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-green-600">
                  <ShoppingCart size={24} />
                  {getCartItemsCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemsCount()}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-green-600">
                  <User size={24} />
                </Link>
                <Link to="/orders" className="text-gray-600 hover:text-green-600">
                  <Package size={24} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-green-600"
                >
                  <LogOut size={24} />
                </button>
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
