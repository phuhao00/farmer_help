import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isOrganic: '',
    page: 1
  });

  const { data, isLoading, error } = useQuery(
    ['products', filters],
    () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return axios.get(`/api/products?${params}`).then(res => res.data);
    },
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'meat', label: 'Meat' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'other', label: 'Other' }
  ];

  if (error) {
    return (
      <div className="container py-8">
        <div className="error">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Fresh Products</h1>
        <p className="text-gray-600">
          Discover fresh, local produce from farmers in your area
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="form-input pl-10"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Category */}
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Organic Filter */}
          <select
            className="form-select"
            value={filters.isOrganic}
            onChange={(e) => handleFilterChange('isOrganic', e.target.value)}
          >
            <option value="">All Products</option>
            <option value="true">Organic Only</option>
            <option value="false">Non-Organic</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ search: '', category: '', isOrganic: '', page: 1 })}
            className="btn btn-outline"
          >
            <Filter size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {data?.total || 0} products found
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>

          {/* Products */}
          {data?.products?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded ${
                      page === filters.page
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
