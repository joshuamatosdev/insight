import {describe, expect, it} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {InvoiceSummary} from './InvoiceSummary';

describe('InvoiceSummary', () => {
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
    it('should display Pending and Paid labels', () => {
      render(<InvoiceSummary />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Paid (This Month)')).toBeInTheDocument();
    });

    it('should display totals after loading', async () => {
      render(<InvoiceSummary />);

      await waitFor(
        () => {
          // Pending = submitted (45000) + approved (78500) = $123,500
          expect(screen.getByText('$123,500')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Paid = $32,000 - appears in both summary and invoice row, so use getAllByText
      expect(screen.getAllByText('$32,000').length).toBeGreaterThan(0);
    });
  });

  describe('Recent Invoices', () => {
    it('should display invoice details after loading', async () => {
      render(<InvoiceSummary />);

      await waitFor(
        () => {
          expect(screen.getByText('Recent Invoices')).toBeInTheDocument();
          expect(screen.getByText('INV-2024-0042')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(screen.getByText('INV-2024-0041')).toBeInTheDocument();
      expect(screen.getByText('INV-2024-0040')).toBeInTheDocument();
    });

    it('should display invoice amounts', async () => {
      render(<InvoiceSummary />);

      await waitFor(
        () => {
          expect(screen.getByText('$45,000')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(screen.getByText('$78,500')).toBeInTheDocument();
      // $32,000 appears in both summary and invoice row
      expect(screen.getAllByText('$32,000').length).toBeGreaterThan(0);
    });

    it('should display invoice statuses', async () => {
      render(<InvoiceSummary />);

      await waitFor(
        () => {
          expect(screen.getByText('submitted')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(screen.getByText('approved')).toBeInTheDocument();
      expect(screen.getByText('paid')).toBeInTheDocument();
    });
  });
});
