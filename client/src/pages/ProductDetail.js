import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ShoppingCart, MapPin, Calendar, Star, Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => axios.get(`/api/products/${id}`).then(res => res.data),
    {
      enabled: !!id,
    }
  );

  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.unit} of ${product.name} added to cart!`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="error">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            {product.images && product.images.length > 0 ? (
              <img
                src={`/uploads/${product.images[selectedImage]}`}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-lg">No image available</span>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'border-green-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={`/uploads/${image}`}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            {product.isOrganic && (
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                Organic
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-lg ml-2">per {product.unit}</span>
          </div>

          <div className="flex items-center text-gray-600 mb-4">
            <MapPin size={16} className="mr-2" />
            <span>{product.farmer?.farmInfo?.farmName || product.farmer?.name}</span>
          </div>

          {product.harvestDate && (
            <div className="flex items-center text-gray-600 mb-4">
              <Calendar size={16} className="mr-2" />
              <span>Harvested: {formatDate(product.harvestDate)}</span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-gray-600">
                {product.quantity} {product.unit} available
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="btn btn-primary w-full"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>

          {/* Product Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Farmer Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">About the Farmer</h3>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400 font-semibold">
                  {product.farmer?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-semibold">{product.farmer?.name}</h4>
                <p className="text-gray-600">{product.farmer?.farmInfo?.farmName}</p>
                {product.farmer?.address && (
                  <p className="text-sm text-gray-500">
                    {product.farmer.address.city}, {product.farmer.address.state}
                  </p>
                )}
                {product.farmer?.phone && (
                  <p className="text-sm text-gray-500">
                    Phone: {product.farmer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
