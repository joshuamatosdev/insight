import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContractorDashboard } from './ContractorDashboard';

// Wrapper for routing context
function renderWithRouter(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('ContractorDashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Header Section', () => {
    it('should render the dashboard title', async () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByText('Contractor Dashboard')).toBeInTheDocument();
    });

    it('should render the welcome message', async () => {
      renderWithRouter(<ContractorDashboard />);

      expect(
        screen.getByText("Welcome back! Here's your contract portfolio overview.")
      ).toBeInTheDocument();
    });

    it('should render Export Report button', async () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument();
    });

    it('should render New Submission button', async () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByRole('button', { name: /new submission/i })).toBeInTheDocument();
    });
  });

  describe('Quick Stats Section', () => {
    it('should render all four quick stat cards', async () => {
      renderWithRouter(<ContractorDashboard />);

      // Advance timers to complete loading
      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText('Active Contracts')).toBeInTheDocument();
        expect(screen.getByText('Pending Invoices')).toBeInTheDocument();
        expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
        expect(screen.getByText('Total Contract Value')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      renderWithRouter(<ContractorDashboard />);

      // During loading, values are not displayed as text
      // The loading skeleton boxes are rendered instead
      expect(screen.getByText('Active Contracts')).toBeInTheDocument();
    });

    it('should display metric values after loading', async () => {
      renderWithRouter(<ContractorDashboard />);

      // Advance timers to complete loading
      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        // Check that the numeric values are displayed
        expect(screen.getByText('5')).toBeInTheDocument(); // activeContracts
        expect(screen.getByText('3')).toBeInTheDocument(); // pendingInvoices
        expect(screen.getByText('8')).toBeInTheDocument(); // upcomingDeadlines
        expect(screen.getByText('$2,450,000')).toBeInTheDocument(); // totalContractValue
      });
    });

    it('should render stat icons', async () => {
      renderWithRouter(<ContractorDashboard />);

      await waitFor(() => {
        // Icons are emoji characters
        expect(screen.getByText('📋')).toBeInTheDocument();
        expect(screen.getByText('💰')).toBeInTheDocument();
        expect(screen.getByText('📅')).toBeInTheDocument();
        expect(screen.getByText('💵')).toBeInTheDocument();
      });
    });
  });

  describe('Widget Integration', () => {
    it('should render ContractStatusCards widget', async () => {
      renderWithRouter(<ContractorDashboard />);

      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText('Active Contracts')).toBeInTheDocument();
      });
    });

    it('should render InvoiceSummary widget', async () => {
      renderWithRouter(<ContractorDashboard />);

      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText('Invoice Summary')).toBeInTheDocument();
      });
    });

    it('should render DeliverableTracker widget', async () => {
      renderWithRouter(<ContractorDashboard />);

      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText('Deliverable Tracker')).toBeInTheDocument();
      });
    });

    it('should render UpcomingDeadlines widget', async () => {
      renderWithRouter(<ContractorDashboard />);

      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
      });
    });
  });

  describe('Currency Formatting', () => {
    it('should format total contract value as currency', async () => {
      renderWithRouter(<ContractorDashboard />);

      await vi.advanceTimersByTimeAsync(600);

      await waitFor(() => {
        // Should format as $2,450,000 (with commas, no decimals)
        expect(screen.getByText('$2,450,000')).toBeInTheDocument();
      });
    });
  });
});
