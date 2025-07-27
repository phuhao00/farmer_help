import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Calendar } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="relative">
        {product.images && product.images.length > 0 ? (
          <img
            src={`/uploads/${product.images[0]}`}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {product.isOrganic && (
          <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Organic
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={16} className="mr-1" />
          <span>{product.farmer?.farmInfo?.farmName || product.farmer?.name}</span>
        </div>

        {product.harvestDate && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar size={16} className="mr-1" />
            <span>Harvested: {formatDate(product.harvestDate)}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm">/{product.unit}</span>
          </div>
          <span className="text-sm text-gray-500">
            {product.quantity} {product.unit} available
          </span>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/products/${product._id}`}
            className="btn btn-outline btn-sm flex-1 justify-center"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="btn btn-primary btn-sm"
            disabled={product.quantity === 0}
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {product.tags && product.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
