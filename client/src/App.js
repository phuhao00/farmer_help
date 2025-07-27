import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ResponsiveLayout from './components/ResponsiveLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Farmers from './pages/Farmers';
import FarmerProfile from './pages/FarmerProfile';

// Components
import CustomerDashboard from './components/CustomerDashboard';
import FarmerDashboard from './components/FarmerDashboard';
import OrderTracking from './components/OrderTracking';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/farmers" element={<Farmers />} />
      <Route path="/farmers/:id" element={<FarmerProfile />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'farmer' ? <FarmerDashboard /> : <CustomerDashboard />}
        </ProtectedRoute>
      } />
      
      <Route path="/cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
      
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <OrderTracking orderId={window.location.pathname.split('/').pop()} userRole={user?.role} />
        </ProtectedRoute>
      } />

      {/* Farmer Routes */}
      <Route path="/farmer/*" element={
        <ProtectedRoute requiredRole="farmer">
          <Routes>
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="products" element={<FarmerDashboard />} />
            <Route path="orders" element={<FarmerDashboard />} />
            <Route path="profile" element={<FarmerProfile />} />
            <Route path="settings" element={<FarmerDashboard />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ResponsiveLayout>
              <AppRoutes />
            </ResponsiveLayout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;