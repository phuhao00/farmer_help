import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

// Create a custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const AllTheProviders = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock user data
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer',
  createdAt: '2024-01-01T00:00:00Z',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
};

export const mockFarmer = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'farmer',
  createdAt: '2024-01-01T00:00:00Z',
  farmName: 'Green Valley Farm',
  location: 'California',
};

// Mock product data
export const mockProduct = {
  _id: '507f1f77bcf86cd799439013',
  name: 'Fresh Tomatoes',
  description: 'Organic vine-ripened tomatoes',
  price: 4.99,
  category: 'Vegetables',
  stock: 50,
  unit: 'lb',
  farmerId: '507f1f77bcf86cd799439012',
  farmer: mockFarmer,
  images: ['https://images.unsplash.com/photo-1546470427-e26264be0b0d'],
  createdAt: '2024-01-01T00:00:00Z',
};

// Mock order data
export const mockOrder = {
  _id: '507f1f77bcf86cd799439014',
  customerId: '507f1f77bcf86cd799439011',
  customer: mockUser,
  items: [
    {
      productId: '507f1f77bcf86cd799439013',
      product: mockProduct,
      quantity: 2,
      price: 4.99,
    },
  ],
  totalAmount: 9.98,
  status: 'confirmed',
  paymentStatus: 'completed',
  paymentIntentId: 'pi_test_123',
  deliveryAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  estimatedDelivery: '2024-01-20T10:00:00Z',
};

// Performance testing utilities
export const measureComponentPerformance = (Component, props = {}) => {
  const startTime = performance.now();
  const { unmount } = renderWithProviders(<Component {...props} />);
  const renderTime = performance.now() - startTime;
  
  const unmountStartTime = performance.now();
  unmount();
  const unmountTime = performance.now() - unmountStartTime;
  
  return {
    renderTime,
    unmountTime,
    totalTime: renderTime + unmountTime,
  };
};

// Mock API responses
export const mockApiResponses = {
  orders: [mockOrder],
  products: [mockProduct],
  user: mockUser,
  farmer: mockFarmer,
  paymentIntent: {
    client_secret: 'pi_test_123_secret_test',
    payment_id: 'pi_test_123',
  },
  paymentConfirmation: {
    status: 'succeeded',
    payment_status: 'completed',
    order_status: 'confirmed',
  },
};

// Setup fetch mocks
export const setupFetchMocks = () => {
  global.fetch = jest.fn((url, options) => {
    const method = options?.method || 'GET';
    
    // Mock different API endpoints
    if (url.includes('/api/orders/my-orders')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.orders),
      });
    }
    
    if (url.includes('/api/products')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.products),
      });
    }
    
    if (url.includes('/api/payment/create-intent') && method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.paymentIntent),
      });
    }
    
    if (url.includes('/api/payment/confirm') && method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockApiResponses.paymentConfirmation),
      });
    }
    
    // Default response
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });
};

// Cleanup function
export const cleanupFetchMocks = () => {
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
};

// Device simulation utilities
export const simulateDevice = (deviceType) => {
  const devices = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  };
  
  const device = devices[deviceType] || devices.desktop;
  
  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: device.width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: device.height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Network simulation
export const simulateNetworkCondition = (condition) => {
  const conditions = {
    slow3g: { effectiveType: '3g', downlink: 0.4, rtt: 400 },
    fast3g: { effectiveType: '3g', downlink: 1.5, rtt: 300 },
    '4g': { effectiveType: '4g', downlink: 10, rtt: 100 },
    offline: { effectiveType: 'none', downlink: 0, rtt: 0 },
  };
  
  const networkInfo = conditions[condition] || conditions['4g'];
  
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
      ...networkInfo,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  });
  
  // Simulate online/offline status
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: condition !== 'offline',
  });
};

export * from '@testing-library/react';
export { renderWithProviders as render };