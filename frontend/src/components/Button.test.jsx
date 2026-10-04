import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button.jsx';

describe('Button', () => {
  it('renders its label and is enabled by default', () => {
    render(<Button>Sign in</Button>);

    const button = screen.getByRole('button', { name: 'Sign in' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });
});
