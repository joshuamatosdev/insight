import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Box} from './Box';

describe('Box', () => {
  it('renders children correctly', () => {
    render(<Box>Hello World</Box>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders as a div by default', () => {
    render(<Box data-testid="box">Content</Box>);
    const box = screen.getByTestId('box');
    expect(box.tagName).toBe('DIV');
  });

  it('renders as a span when specified', () => {
    render(<Box as="span" data-testid="box">Content</Box>);
    const box = screen.getByTestId('box');
    expect(box.tagName).toBe('SPAN');
  });

  it('applies className correctly', () => {
    render(<Box className="custom-class" data-testid="box">Content</Box>);
    const box = screen.getByTestId('box');
    expect(box).toHaveClass('custom-class');
  });

  it('applies inline styles correctly', () => {
    render(
      <Box style={{ padding: '10px' }} data-testid="box">
        Content
      </Box>
    );
    const box = screen.getByTestId('box');
    expect(box).toHaveStyle({ padding: '10px' });
  });

  it('passes through additional HTML attributes', () => {
    render(
      <Box id="my-box" role="region" aria-label="My Region" data-testid="box">
        Content
      </Box>
    );
    const box = screen.getByTestId('box');
    expect(box).toHaveAttribute('id', 'my-box');
    expect(box).toHaveAttribute('role', 'region');
    expect(box).toHaveAttribute('aria-label', 'My Region');
  });
});
