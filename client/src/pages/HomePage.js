import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, ShoppingCart, Award } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Fresh from Farm to Your Table
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Connect directly with local farmers and enjoy the freshest produce 
              while supporting your community's agricultural economy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn bg-white text-green-600 hover:bg-gray-100">
                <ShoppingCart size={20} />
                Shop Now
              </Link>
              <Link to="/register" className="btn btn-outline border-white text-white hover:bg-white hover:text-green-600">
                Join as Farmer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FarmMarket?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing how fresh produce reaches your table by connecting 
              you directly with local farmers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fresh & Organic</h3>
              <p className="text-gray-600">
                Direct from farm with no middlemen ensures maximum freshness and quality.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Support Local</h3>
              <p className="text-gray-600">
                Help local farmers thrive while building stronger community connections.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
              <p className="text-gray-600">
                Browse, select, and order fresh produce with our user-friendly platform.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                Every farmer is verified and products are quality-checked for your satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to get fresh produce delivered to your door</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600">
                Explore fresh produce from local farmers in your area. Filter by category, 
                organic options, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Your Order</h3>
              <p className="text-gray-600">
                Add items to your cart and checkout securely. Choose your preferred 
                delivery time and method.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Fresh Produce</h3>
              <p className="text-gray-600">
                Receive your fresh, quality produce and enjoy knowing you've supported 
                local agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Farmers Section */}
      <section className="py-16 bg-green-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">For Farmers</h2>
              <p className="text-gray-600 mb-6">
                Join our platform and reach customers directly. Increase your profits 
                by cutting out middlemen and build lasting relationships with your community.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="bg-green-600 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Set your own prices and control your sales</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-600 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Easy-to-use dashboard for managing products and orders</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-600 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Direct communication with customers</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-600 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Build your brand and customer loyalty</span>
                </li>
              </ul>

              <Link to="/register" className="btn btn-primary">
                Start Selling Today
              </Link>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Success Story</h3>
              <blockquote className="text-gray-600 italic mb-4">
                "FarmMarket has transformed my business. I can now sell directly to customers 
                and get fair prices for my organic vegetables. My customer base has grown 
                300% in just 6 months!"
              </blockquote>
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="font-semibold">JS</span>
                </div>
                <div>
                  <p className="font-semibold">John Smith</p>
                  <p className="text-sm text-gray-600">Green Valley Farm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of customers and farmers already using FarmMarket
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-green-600 hover:bg-gray-100">
              Create Account
            </Link>
            <Link to="/products" className="btn btn-outline border-white text-white hover:bg-white hover:text-green-600">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
