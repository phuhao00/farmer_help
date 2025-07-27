import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { X, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddProductModal = ({ onClose, onSuccess }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const addProductMutation = useMutation(
    (formData) => axios.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: () => {
        toast.success('Product added successfully!');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add product');
      }
    }
  );

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    const formData = new FormData();
    
    // Append form fields
    Object.keys(data).forEach(key => {
      if (data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    
    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });

    addProductMutation.mutate(formData);
    setLoading(false);
  };

  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'meat', label: 'Meat' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'piece', label: 'Piece' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'bundle', label: 'Bundle' },
    { value: 'liter', label: 'Liter' },
    { value: 'gallon', label: 'Gallon' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  {...register('name', { required: 'Product name is required' })}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  className="form-select"
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                className="form-textarea"
                rows="3"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Pricing and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  className="form-input"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="unit" className="form-label">
                  Unit *
                </label>
                <select
                  id="unit"
                  className="form-select"
                  {...register('unit', { required: 'Unit is required' })}
                >
                  <option value="">Select unit</option>
                  {units.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-600 text-sm mt-1">{errors.unit.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="quantity" className="form-label">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="form-input"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 0, message: 'Quantity must be positive' }
                  })}
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="harvestDate" className="form-label">
                  Harvest Date
                </label>
                <input
                  type="date"
                  id="harvestDate"
                  className="form-input"
                  {...register('harvestDate')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate" className="form-label">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  className="form-input"
                  {...register('expiryDate')}
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isOrganic"
                className="mr-2"
                {...register('isOrganic')}
              />
              <label htmlFor="isOrganic" className="form-label mb-0">
                This is an organic product
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                className="form-input"
                placeholder="e.g., fresh, local, seasonal"
                {...register('tags')}
              />
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label htmlFor="images" className="form-label">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="text-green-600 hover:text-green-500">
                      Click to upload images
                    </span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB each (max 5 images)
                  </p>
                </div>
                
                {images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Selected images: {images.length}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {images.map((image, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {image.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
