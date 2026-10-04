import { render, screen } from '@testing-library/react';
import { FullPageSpinner } from './Spinner.jsx';

describe('FullPageSpinner', () => {
  it('renders an accessible loading status', () => {
    render(<FullPageSpinner />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(status.querySelector('.spinner.lg')).toBeInTheDocument();
  });
});
