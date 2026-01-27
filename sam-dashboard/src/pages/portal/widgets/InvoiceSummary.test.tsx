import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { InvoiceSummary } from './InvoiceSummary';

describe('InvoiceSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Header', () => {
    it('should render the widget title', () => {
      render(<InvoiceSummary />);

      expect(screen.getByText('Invoice Summary')).toBeInTheDocument();
    });

    it('should render Create Invoice button', () => {
      render(<InvoiceSummary />);

      expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('should display Pending label', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('should display Paid label', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('Paid (This Month)')).toBeInTheDocument();
      });
    });

    it('should display pending total after loading', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        // Pending = submitted (45000) + approved (78500) = $123,500
        expect(screen.getByText('$123,500')).toBeInTheDocument();
      });
    });

    it('should display paid total after loading', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        // Paid = $32,000
        expect(screen.getByText('$32,000')).toBeInTheDocument();
      });
    });
  });

  describe('Recent Invoices', () => {
    it('should display Recent Invoices label', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('Recent Invoices')).toBeInTheDocument();
      });
    });

    it('should display invoice numbers', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('INV-2024-0042')).toBeInTheDocument();
        expect(screen.getByText('INV-2024-0041')).toBeInTheDocument();
        expect(screen.getByText('INV-2024-0040')).toBeInTheDocument();
      });
    });

    it('should display contract numbers for invoices', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('FA8773-24-C-0001')).toBeInTheDocument();
        expect(screen.getByText('W912DQ-23-D-0045')).toBeInTheDocument();
        expect(screen.getByText('GS-35F-0123X')).toBeInTheDocument();
      });
    });

    it('should display invoice amounts', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('$45,000')).toBeInTheDocument();
        expect(screen.getByText('$78,500')).toBeInTheDocument();
        expect(screen.getByText('$32,000')).toBeInTheDocument();
      });
    });

    it('should display invoice statuses', async () => {
      render(<InvoiceSummary />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('submitted')).toBeInTheDocument();
        expect(screen.getByText('approved')).toBeInTheDocument();
        expect(screen.getByText('paid')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator for totals', () => {
      render(<InvoiceSummary />);

      // During loading, totals show "..."
      expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    });
  });
});
