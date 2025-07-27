import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../PaymentForm';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    elements: jest.fn(() => ({
      create: jest.fn(() => ({
        mount: jest.fn(),
        destroy: jest.fn(),
        on: jest.fn(),
        update: jest.fn(),
      })),
      getElement: jest.fn(() => ({
        // Mock card element
      })),
    })),
    confirmCardPayment: jest.fn(),
  })),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => children,
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  useStripe: () => ({
    confirmCardPayment: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  totalAmount: 25.99,
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
  },
};

describe('PaymentForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
  });

  test('renders payment form with order details', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        client_secret: 'pi_test_123_secret_test',
        payment_id: 'pi_test_123',
      }),
    });

    render(
      <PaymentForm 
        order={mockOrder}
        onPaymentSuccess={jest.fn()}
        onPaymentError={jest.fn()}
      />
    );

    expect(screen.getByText('Payment Details')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('Secured by Stripe')).toBeInTheDocument();
  });

  test('creates payment intent on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        client_secret: 'pi_test_123_secret_test',
        payment_id: 'pi_test_123',
      }),
    });

    render(
      <PaymentForm 
        order={mockOrder}
        onPaymentSuccess={jest.fn()}
        onPaymentError={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null',
        },
        body: JSON.stringify({
          amount: 2599, // $25.99 in cents
          currency: 'usd',
          order_id: mockOrder._id,
        }),
      });
    });
  });

  test('displays error when payment intent creation fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Payment initialization failed',
      }),
    });

    render(
      <PaymentForm 
        order={mockOrder}
        onPaymentSuccess={jest.fn()}
        onPaymentError={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Payment initialization failed')).toBeInTheDocument();
    });
  });

  test('disables submit button when loading', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        client_secret: 'pi_test_123_secret_test',
        payment_id: 'pi_test_123',
      }),
    });

    render(
      <PaymentForm 
        order={mockOrder}
        onPaymentSuccess={jest.fn()}
        onPaymentError={jest.fn()}
      />
    );

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });
});