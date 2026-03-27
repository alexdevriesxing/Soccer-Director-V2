import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import V2RouteErrorBoundary from './V2RouteErrorBoundary';

const Thrower: React.FC = () => {
  throw new Error('Simulated route failure');
};

describe('V2RouteErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders a recovery fallback when a child route throws', () => {
    renderBoundary();

    expect(screen.getByTestId('v2-route-error-boundary')).toBeInTheDocument();
    expect(screen.getByText('Interface recovery required')).toBeInTheDocument();
    expect(screen.getByText('Simulated route failure')).toBeInTheDocument();
  });

  it('exposes safe recovery actions after a route crash', () => {
    renderBoundary();

    expect(screen.getByRole('button', { name: /retry page/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to hq/i })).toHaveAttribute('href', '/hq');
    expect(screen.getByRole('link', { name: /open save \/ load/i })).toHaveAttribute('href', '/save-load');
  });
});

function renderBoundary() {
  return render(
    <MemoryRouter>
      <V2RouteErrorBoundary>
        <Thrower />
      </V2RouteErrorBoundary>
    </MemoryRouter>
  );
}
