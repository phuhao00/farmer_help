import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const watchRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        }
      };

      if (data.role === 'farmer') {
        userData.farmInfo = {
          farmName: data.farmName,
          farmSize: data.farmSize,
          farmType: data.farmType,
          description: data.farmDescription
        };
      }

      const result = await registerUser(userData);
      if (result.success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
              <p className="text-gray-600 mt-2">Join our farming community</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    {...register('name', {
                      required: 'Name is required'
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="form-input pr-10"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-input"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">
                  I am a
                </label>
                <select
                  id="role"
                  className="form-select"
                  {...register('role', {
                    required: 'Please select a role'
                  })}
                >
                  <option value="">Select...</option>
                  <option value="customer">Customer</option>
                  <option value="farmer">Farmer</option>
                </select>
                {errors.role && (
                  <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label htmlFor="street" className="form-label">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      className="form-input"
                      {...register('street', {
                        required: 'Street address is required'
                      })}
                    />
                    {errors.street && (
                      <p className="text-red-600 text-sm mt-1">{errors.street.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        className="form-input"
                        {...register('city', {
                          required: 'City is required'
                        })}
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="state" className="form-label">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        className="form-input"
                        {...register('state', {
                          required: 'State is required'
                        })}
                      />
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="zipCode" className="form-label">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        className="form-input"
                        {...register('zipCode', {
                          required: 'ZIP code is required'
                        })}
                      />
                      {errors.zipCode && (
                        <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Farm Information (only for farmers) */}
              {watchRole === 'farmer' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Farm Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-group">
                      <label htmlFor="farmName" className="form-label">
                        Farm Name
                      </label>
                      <input
                        type="text"
                        id="farmName"
                        className="form-input"
                        {...register('farmName', {
                          required: watchRole === 'farmer' ? 'Farm name is required' : false
                        })}
                      />
                      {errors.farmName && (
                        <p className="text-red-600 text-sm mt-1">{errors.farmName.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="farmSize" className="form-label">
                          Farm Size
                        </label>
                        <input
                          type="text"
                          id="farmSize"
                          className="form-input"
                          placeholder="e.g., 10 acres"
                          {...register('farmSize')}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="farmType" className="form-label">
                          Farm Type
                        </label>
                        <select
                          id="farmType"
                          className="form-select"
                          {...register('farmType')}
                        >
                          <option value="">Select...</option>
                          <option value="vegetable">Vegetable Farm</option>
                          <option value="fruit">Fruit Farm</option>
                          <option value="dairy">Dairy Farm</option>
                          <option value="grain">Grain Farm</option>
                          <option value="mixed">Mixed Farm</option>
                          <option value="organic">Organic Farm</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="farmDescription" className="form-label">
                        Farm Description
                      </label>
                      <textarea
                        id="farmDescription"
                        className="form-textarea"
                        placeholder="Tell us about your farm..."
                        {...register('farmDescription')}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-500 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
