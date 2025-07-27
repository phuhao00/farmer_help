import React, { useState, useEffect } from 'react';
import EnhancedProductManager from './EnhancedProductManager';
import OrderManagement from './OrderManagement';
import { BarChart3, Package, ShoppingCart, DollarSign } from 'lucide-react';

const FarmerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/farmer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/farmer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const lowStockProducts = products.filter(product => product.stock < 10).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20 lg:pb-0 pt-16 lg:pt-0">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container py-3 lg:py-4 px-4 lg:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
              <p className="text-gray-600 text-sm lg:text-base">Manage your farm products and orders</p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back!</p>
                <p className="font-semibold">Farm Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container px-4 lg:px-0">
          <nav className="flex space-x-4 lg:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 lg:py-4 px-2 lg:px-2 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-3 lg:w-4 h-3 lg:h-4 inline mr-1 lg:mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 lg:py-4 px-2 lg:px-2 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-3 lg:w-4 h-3 lg:h-4 inline mr-1 lg:mr-2" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 lg:py-4 px-2 lg:px-2 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart className="w-3 lg:w-4 h-3 lg:h-4 inline mr-1 lg:mr-2" />
              Orders
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container py-4 lg:py-6 px-4 lg:px-0">
        {activeTab === 'overview' && (
          <div className="space-y-4 lg:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <div className="card p-3 lg:p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Package className="w-4 lg:w-6 h-4 lg:h-6 text-primary-600" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>

              <div className="card p-3 lg:p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ShoppingCart className="w-4 lg:w-6 h-4 lg:h-6 text-orange-600" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{pendingOrders}</p>
                  </div>
                </div>
              </div>

              <div className="card p-3 lg:p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-4 lg:w-6 h-4 lg:h-6 text-green-600" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="card p-3 lg:p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Package className="w-4 lg:w-6 h-4 lg:h-6 text-red-600" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-lg lg:text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order._id?.slice(-6) || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No orders yet</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                <div className="space-y-3">
                  {products.slice(0, 5).map(product => (
                    <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock} {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.price}</p>
                        <p className="text-sm text-gray-600">{product.category}</p>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No products yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <EnhancedProductManager />
        )}

        {activeTab === 'orders' && (
          <OrderManagement />
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;