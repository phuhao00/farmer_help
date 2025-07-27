import React from 'react';
import { useQuery } from 'react-query';
import { Package, Calendar, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading, error } = useQuery(
    'orders',
    () => {
      const endpoint = user?.role === 'farmer' ? '/api/orders/farmer-orders' : '/api/orders/my-orders';
      return axios.get(endpoint).then(res => res.data);
    },
    {
      enabled: !!user,
      staleTime: 30000,
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="error">
          Error loading orders. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {user?.role === 'farmer' ? 'Customer Orders' : 'My Orders'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'farmer' 
            ? 'Manage orders for your products' 
            : 'Track your orders and purchase history'
          }
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="card">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <h3 className="font-semibold text-lg">
                    Order #{order._id.substring(0, 8)}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar size={16} className="mr-1" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-lg font-bold mt-1">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Customer/Farmer Info */}
              {user?.role === 'farmer' && order.customer && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>Name:</strong> {order.customer.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {order.customer.email}
                    </div>
                    {order.customer.phone && (
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        {order.customer.phone}
                      </div>
                    )}
                    {order.deliveryAddress && (
                      <div className="flex items-start">
                        <MapPin size={14} className="mr-1 mt-0.5" />
                        <span>
                          {order.deliveryAddress.street}, {order.deliveryAddress.city}, 
                          {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-semibold mb-3">Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={`/uploads/${item.product.images[0]}`}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h5 className="font-semibold">{item.product.name}</h5>
                        {user?.role !== 'farmer' && item.product.farmer && (
                          <p className="text-sm text-gray-600">
                            by {item.product.farmer.farmInfo?.farmName || item.product.farmer.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} {item.product.unit}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} per {item.product.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              {order.deliveryAddress && user?.role !== 'farmer' && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Delivery Address
                  </h4>
                  <p className="text-sm">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                </div>
              )}

              {/* Order Notes */}
              {order.notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Order Notes</h4>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {user?.role === 'farmer' ? 'No orders yet' : 'No orders found'}
          </p>
          <p className="text-gray-400">
            {user?.role === 'farmer' 
              ? 'Orders will appear here when customers purchase your products'
              : 'Start shopping to see your orders here'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;
