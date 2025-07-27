import React from 'react';
import { useQuery } from 'react-query';
import { ShoppingBag, Package, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CustomerDashboard = () => {
  const { user } = useAuth();

  // Fetch customer's orders
  const { data: orders, isLoading } = useQuery(
    'customer-orders',
    () => axios.get('/api/orders/my-orders').then(res => res.data),
    {
      staleTime: 30000,
    }
  );

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.reduce((total, order) => total + order.totalAmount, 0) || 0;
  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="pb-20 lg:pb-0 pt-16 lg:pt-0">
      <div className="mb-6 lg:mb-8 px-4 lg:px-0">
        <h1 className="text-2xl lg:text-3xl font-bold">Customer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8 px-4 lg:px-0">
        <div className="card p-4 lg:p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 lg:p-3 mr-3 lg:mr-4">
              <ShoppingBag className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Total Orders</p>
              <p className="text-xl lg:text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 lg:p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 lg:p-3 mr-3 lg:mr-4">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Total Spent</p>
              <p className="text-xl lg:text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 lg:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-2 lg:p-3 mr-3 lg:mr-4">
              <User className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Member Since</p>
              <p className="text-xl lg:text-2xl font-bold">
                {new Date(user.createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8 px-4 lg:px-0">
        <Link to="/products" className="card hover:shadow-lg transition-shadow text-center p-4 lg:p-6">
          <ShoppingBag className="text-green-600 mx-auto mb-2" size={24} />
          <h3 className="font-semibold text-sm lg:text-base">Browse Products</h3>
        </Link>
        
        <Link to="/farmers" className="card hover:shadow-lg transition-shadow text-center p-4 lg:p-6">
          <User className="text-blue-600 mx-auto mb-2" size={24} />
          <h3 className="font-semibold text-sm lg:text-base">Find Farmers</h3>
        </Link>
        
        <Link to="/orders" className="card hover:shadow-lg transition-shadow text-center p-4 lg:p-6">
          <Package className="text-purple-600 mx-auto mb-2" size={24} />
          <h3 className="font-semibold text-sm lg:text-base">My Orders</h3>
        </Link>
        
        <Link to="/cart" className="card hover:shadow-lg transition-shadow text-center p-4 lg:p-6">
          <ShoppingBag className="text-orange-600 mx-auto mb-2" size={24} />
          <h3 className="font-semibold text-sm lg:text-base">Shopping Cart</h3>
        </Link>
      </div>

      {/* Profile Information */}
      <div className="card mb-6 lg:mb-8 mx-4 lg:mx-0 p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <h3 className="font-semibold mb-2">Personal Details</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
          </div>
          
          {user.address && (
            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              <div className="flex items-start">
                <MapPin className="text-gray-400 mr-2 mt-1" size={16} />
                <div>
                  <p>{user.address.street}</p>
                  <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                  <p>{user.address.country}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card mx-4 lg:mx-0 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold">Recent Orders</h2>
          <Link to="/orders" className="btn btn-outline btn-sm text-xs lg:text-sm">
            View All Orders
          </Link>
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3 lg:space-y-4">
            {recentOrders.map((order) => (
              <div key={order._id} className="border rounded-lg p-3 lg:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm lg:text-base">
                    Order #{order._id.substring(0, 8)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="text-xs lg:text-sm text-gray-600 mb-2">
                  {order.items.length} items • ${order.totalAmount.toFixed(2)}
                </div>
                
                <div className="text-xs lg:text-sm text-gray-500">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 lg:py-8">
            <p className="text-gray-500 mb-4 text-sm lg:text-base">No orders yet</p>
            <Link to="/products" className="btn btn-primary text-sm lg:text-base">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
