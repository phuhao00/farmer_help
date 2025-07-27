import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderTracking from '../OrderTracking';

// Mock fetch
global.fetch = jest.fn();

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  status: 'confirmed',
  totalAmount: 45.99,
  paymentStatus: 'completed',
  createdAt: '2024-01-15T10:00:00Z',
  estimatedDelivery: '2024-01-20T10:00:00Z',
  items: [
    {
      product: { name: 'Fresh Tomatoes' },
      quantity: 2,
      price: 12.99,
    },
    {
      product: { name: 'Organic Lettuce' },
      quantity: 1,
      price: 8.99,
    },
  ],
  deliveryAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
  },
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('OrderTracking', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('token', 'mock-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders order details correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    await waitFor(() => {
      expect(screen.getByText(/Order #/)).toBeInTheDocument();
      expect(screen.getByText('99439011')).toBeInTheDocument();
      expect(screen.getByText('$45.99')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  test('displays order progress correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    await waitFor(() => {
      expect(screen.getByText('Order Progress')).toBeInTheDocument();
      expect(screen.getByText('Order Placed')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Preparing')).toBeInTheDocument();
    });
  });

  test('shows farmer controls for farmer role', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockOrder, status: 'preparing' }),
    });

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="farmer" />
    );

    await waitFor(() => {
      expect(screen.getByText('Update Order Status')).toBeInTheDocument();
      expect(screen.getByText('Mark as Ready')).toBeInTheDocument();
    });
  });

  test('displays delivery address', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    await waitFor(() => {
      expect(screen.getByText('Delivery Address')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Anytown, CA 12345')).toBeInTheDocument();
    });
  });

  test('displays order items', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    await waitFor(() => {
      expect(screen.getByText('Order Items')).toBeInTheDocument();
      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Organic Lettuce')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
      expect(screen.getByText('$25.98')).toBeInTheDocument(); // 2 * 12.99
    });
  });

  test('handles loading state', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    // Check for loading animation classes
    const loadingElements = document.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('handles error state', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('polls for updates every 30 seconds', async () => {
    jest.useFakeTimers();
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockOrder,
    });

    renderWithRouter(
      <OrderTracking orderId="507f1f77bcf86cd799439011" userRole="customer" />
    );

    // Initial call
    expect(fetch).toHaveBeenCalledTimes(1);

    // Fast forward 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });
});