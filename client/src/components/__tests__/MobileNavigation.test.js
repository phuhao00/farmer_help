import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MobileNavigation from '../MobileNavigation';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('MobileNavigation', () => {
  test('renders customer navigation items', () => {
    renderWithRouter(
      <MobileNavigation 
        userRole="customer" 
        cartItemCount={3} 
        notifications={0} 
      />
    );

    expect(screen.getByText('Farm Fresh')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('renders farmer navigation items', () => {
    renderWithRouter(
      <MobileNavigation 
        userRole="farmer" 
        cartItemCount={0} 
        notifications={2} 
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('displays cart item count badge', () => {
    renderWithRouter(
      <MobileNavigation 
        userRole="customer" 
        cartItemCount={5} 
        notifications={0} 
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('displays notification badge', () => {
    renderWithRouter(
      <MobileNavigation 
        userRole="farmer" 
        cartItemCount={0} 
        notifications={3} 
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('opens and closes side menu', () => {
    renderWithRouter(
      <MobileNavigation 
        userRole="customer" 
        cartItemCount={0} 
        notifications={0} 
      />
    );

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Customer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('handles sign out', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    renderWithRouter(
      <MobileNavigation 
        userRole="customer" 
        cartItemCount={0} 
        notifications={0} 
      />
    );

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });

  test('shows correct badge count for high numbers', () => {
    renderWithRouter(
      <MobileNavigation 
        userRole="customer" 
        cartItemCount={15} 
        notifications={0} 
      />
    );

    expect(screen.getByText('9+')).toBeInTheDocument();
  });
});