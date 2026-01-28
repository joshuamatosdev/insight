import {describe, expect, it} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {BrowserRouter} from 'react-router-dom';
import {ContractorDashboard} from './ContractorDashboard';

// Wrapper for routing context
function renderWithRouter(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('ContractorDashboard', () => {
  describe('Header Section', () => {
    it('should render the dashboard title', () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByText('Contractor Dashboard')).toBeInTheDocument();
    });

    it('should render the welcome message', () => {
      renderWithRouter(<ContractorDashboard />);

      expect(
        screen.getByText("Welcome back! Here's your contract portfolio overview.")
      ).toBeInTheDocument();
    });

    it('should render Export Report button', () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument();
    });

    it('should render New Submission button', () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByRole('button', { name: /new submission/i })).toBeInTheDocument();
    });
  });

  describe('Quick Stats Section', () => {
    it('should render all four quick stat card labels', () => {
      renderWithRouter(<ContractorDashboard />);

      // "Active Contracts" appears in both quick stats and widget header, use getAllByText
      expect(screen.getAllByText('Active Contracts').length).toBeGreaterThan(0);
      expect(screen.getByText('Pending Invoices')).toBeInTheDocument();
      // "Upcoming Deadlines" appears in both quick stats and widget header
      expect(screen.getAllByText('Upcoming Deadlines').length).toBeGreaterThan(0);
      expect(screen.getByText('Total Contract Value')).toBeInTheDocument();
    });

    it('should display metric values after loading', async () => {
      renderWithRouter(<ContractorDashboard />);

      await waitFor(
        () => {
          expect(screen.getByText('5')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('$2,450,000')).toBeInTheDocument();
    });

    it('should render stat icons', () => {
      renderWithRouter(<ContractorDashboard />);

      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
      expect(screen.getByText('📅')).toBeInTheDocument();
      expect(screen.getByText('💵')).toBeInTheDocument();
    });
  });

  describe('Widget Headers', () => {
    it('should render widget headers', async () => {
      renderWithRouter(<ContractorDashboard />);

      // These should be present immediately as they're in child components
      await waitFor(
        () => {
          expect(screen.getByText('Invoice Summary')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(screen.getByText('Deliverable Tracker')).toBeInTheDocument();
      // "Upcoming Deadlines" appears in both quick stats and widget header
      expect(screen.getAllByText('Upcoming Deadlines').length).toBeGreaterThan(0);
    });
  });
});
