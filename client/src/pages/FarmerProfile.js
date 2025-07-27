import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapPin, Phone, Mail, Award } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const FarmerProfile = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery(
    ['farmer', id],
    () => axios.get(`/api/farmers/${id}`).then(res => res.data),
    {
      enabled: !!id,
      staleTime: 60000,
    }
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8">
        <div className="error">
          Farmer not found
        </div>
      </div>
    );
  }

  const { farmer, products } = data;

  return (
    <div className="container py-8">
      {/* Farmer Header */}
      <div className="card mb-8">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 font-bold text-3xl">
              {farmer.name.charAt(0)}
            </span>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{farmer.name}</h1>
            {farmer.farmInfo?.farmName && (
              <h2 className="text-xl text-green-600 font-semibold mb-2">
                {farmer.farmInfo.farmName}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {farmer.farmInfo?.farmType && (
                <div>
                  <span className="font-medium">Farm Type:</span>
                  <span className="ml-2 capitalize">{farmer.farmInfo.farmType}</span>
                </div>
              )}

              {farmer.farmInfo?.farmSize && (
                <div>
                  <span className="font-medium">Farm Size:</span>
                  <span className="ml-2">{farmer.farmInfo.farmSize}</span>
                </div>
              )}

              {farmer.address && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>
                    {farmer.address.city}, {farmer.address.state} {farmer.address.zipCode}
                  </span>
                </div>
              )}

              {farmer.phone && (
                <div className="flex items-center">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  <span>{farmer.phone}</span>
                </div>
              )}
            </div>

            {farmer.email && (
              <div className="flex items-center mb-4">
                <Mail size={16} className="mr-2 text-gray-400" />
                <span>{farmer.email}</span>
              </div>
            )}

            {farmer.farmInfo?.description && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">About the Farm</h3>
                <p className="text-gray-600 leading-relaxed">
                  {farmer.farmInfo.description}
                </p>
              </div>
            )}

            {/* Certifications */}
            {farmer.farmInfo?.certifications && farmer.farmInfo.certifications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Award size={16} className="mr-2" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {farmer.farmInfo.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Products</h2>
          <span className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available</p>
            <p className="text-gray-400">Check back later for new products</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerProfile;
