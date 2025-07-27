import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import FarmerDashboard from '../components/FarmerDashboard';
import CustomerDashboard from '../components/CustomerDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="error">
          Please log in to access your dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {user.role === 'farmer' ? (
        <FarmerDashboard />
      ) : (
        <CustomerDashboard />
      )}
    </div>
  );
};

export default Dashboard;
