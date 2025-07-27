import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  MessageSquare, 
  Eye,
  Filter,
  Search
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const orderStatuses = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'orange' },
    { value: 'ready', label: 'Ready for Pickup', color: 'purple' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'indigo' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/farmer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        // Send notification to customer
        await sendStatusNotification(orderId, newStatus);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const sendStatusNotification = async (orderId, status) => {
    try {
      await fetch('/api/notifications/order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId, status })
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <Package className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    const color = getStatusColor(status);
    return `px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Track and manage your customer orders</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by order ID or customer name..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              className="form-input min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {orderStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Order #{order._id?.slice(-8) || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Customer: {order.customer?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadgeClass(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">
                        {order.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedOrder === order._id ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-semibold">{order.items?.length || 0} products</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="font-semibold text-sm">
                      {order.deliveryAddress?.street || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-2">
                  {getNextStatus(order.status) && (
                    <Button
                      onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      Mark as {getNextStatus(order.status)?.replace('_', ' ')}
                    </Button>
                  )}
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Button
                      variant="outline"
                      onClick={() => updateOrderStatus(order._id, 'cancelled')}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                  
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message Customer
                  </Button>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder === order._id && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} {item.product?.unit || 'units'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${item.price || 0} per {item.product?.unit || 'unit'}
                            </p>
                          </div>
                        </div>
                      )) || <p className="text-gray-500">No items found</p>}
                    </div>

                    {/* Customer Information */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Customer Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{order.customer?.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{order.customer?.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium">{order.customer?.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Delivery Address</p>
                            <p className="font-medium">
                              {order.deliveryAddress ? 
                                `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` : 
                                'Not provided'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'all' ? 
                `No orders with status "${statusFilter}"` : 
                'You haven\'t received any orders yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;