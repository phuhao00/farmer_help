import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Leaf, Users, ShoppingCart, Truck } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { data: productsData, isLoading } = useQuery(
    'featured-products',
    () => axios.get('/api/products?limit=6').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: farmersData } = useQuery(
    'featured-farmers',
    () => axios.get('/api/farmers?limit=3').then(res => res.data),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-green-50 py-20">
        <div className="container text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Fresh From Farm to Your Table
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect directly with local farmers and get the freshest produce
            delivered to your doorstep. Support sustainable agriculture and
            enjoy farm-fresh quality.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/products" className="btn btn-primary">
              Shop Fresh Produce
            </Link>
            <Link to="/farmers" className="btn btn-outline">
              Meet Our Farmers
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose FarmMarket?
          </h2>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh & Organic</h3>
              <p className="text-gray-600">
                Get the freshest produce directly from local farms with organic options.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Local</h3>
              <p className="text-gray-600">
                Support local farmers and communities while getting quality produce.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
              <p className="text-gray-600">
                Browse, order, and pay online with our simple and secure platform.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick and reliable delivery to bring farm freshness to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="btn btn-outline">
              View All Products
            </Link>
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {productsData?.products?.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Farmers */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Meet Our Farmers</h2>
            <Link to="/farmers" className="btn btn-outline">
              View All Farmers
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {farmersData?.farmers?.map(farmer => (
              <div key={farmer._id} className="card text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{farmer.name}</h3>
                <p className="text-gray-600 mb-2">
                  {farmer.farmInfo?.farmName || 'Local Farm'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {farmer.address?.city}, {farmer.address?.state}
                </p>
                <Link
                  to={`/farmers/${farmer._id}`}
                  className="btn btn-outline btn-sm"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of customers who trust FarmMarket for fresh, local produce.
          </p>
          <Link to="/register" className="btn btn-secondary">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
