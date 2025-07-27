import React from 'react';
import { useQuery } from 'react-query';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Farmers = () => {
  const { data, isLoading, error } = useQuery(
    'farmers',
    () => axios.get('/api/farmers').then(res => res.data),
    {
      staleTime: 60000, // 1 minute
    }
  );

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
          Error loading farmers. Please try again later.
        </div>
      </div>
    );
  }

  const farmers = data?.farmers || [];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Local Farmers</h1>
        <p className="text-gray-600">
          Discover and connect with local farmers in your area
        </p>
      </div>

      {/* Farmers Grid */}
      {farmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map(farmer => (
            <div key={farmer._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold text-xl">
                    {farmer.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{farmer.name}</h3>
                  {farmer.farmInfo?.farmName && (
                    <p className="text-green-600 font-medium">
                      {farmer.farmInfo.farmName}
                    </p>
                  )}
                  {farmer.farmInfo?.farmType && (
                    <p className="text-sm text-gray-600 capitalize">
                      {farmer.farmInfo.farmType} Farm
                    </p>
                  )}
                </div>
              </div>

              {farmer.farmInfo?.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {farmer.farmInfo.description}
                </p>
              )}

              {/* Farm Details */}
              <div className="space-y-2 mb-4">
                {farmer.farmInfo?.farmSize && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Size:</span>
                    <span>{farmer.farmInfo.farmSize}</span>
                  </div>
                )}

                {farmer.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {farmer.address.city}, {farmer.address.state}
                    </span>
                  </div>
                )}

                {farmer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2" />
                    <span>{farmer.phone}</span>
                  </div>
                )}

                {farmer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2" />
                    <span>{farmer.email}</span>
                  </div>
                )}
              </div>

              {/* Certifications */}
              {farmer.farmInfo?.certifications && farmer.farmInfo.certifications.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Certifications:</p>
                  <div className="flex flex-wrap gap-1">
                    {farmer.farmInfo.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <Link
                  to={`/farmers/${farmer._id}`}
                  className="btn btn-primary btn-sm flex-1 justify-center"
                >
                  View Profile
                </Link>
                <Link
                  to={`/products?farmer=${farmer._id}`}
                  className="btn btn-outline btn-sm"
                >
                  Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No farmers found</p>
          <p className="text-gray-400">Check back later for new farmers</p>
        </div>
      )}

      {/* Call to Action for Farmers */}
      <div className="mt-16 bg-green-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Are you a farmer?</h2>
        <p className="text-gray-600 mb-6">
          Join our platform to sell your fresh produce directly to customers
        </p>
        <Link to="/register" className="btn btn-primary">
          Join as Farmer
        </Link>
      </div>
    </div>
  );
};

export default Farmers;
