import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UpcomingDeadlines } from './UpcomingDeadlines';

describe('UpcomingDeadlines', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Header', () => {
    it('should render the widget title', () => {
      render(<UpcomingDeadlines />);

      expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
    });

    it('should render View Calendar button', () => {
      render(<UpcomingDeadlines />);

      expect(screen.getByRole('button', { name: /view calendar/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading text initially', () => {
      render(<UpcomingDeadlines />);

      expect(screen.getByText('Loading deadlines...')).toBeInTheDocument();
    });
  });

  describe('Deadline Display', () => {
    it('should display deadline titles after loading', async () => {
      render(<UpcomingDeadlines />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('Monthly Status Report')).toBeInTheDocument();
        expect(screen.getByText('Invoice Submission')).toBeInTheDocument();
        expect(screen.getByText('Quarterly Program Review')).toBeInTheDocument();
        expect(screen.getByText('Technical Documentation Update')).toBeInTheDocument();
        expect(screen.getByText('Security Review Meeting')).toBeInTheDocument();
      });
    });

    it('should display contract numbers', async () => {
      render(<UpcomingDeadlines />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getAllByText('FA8773-24-C-0001').length).toBeGreaterThan(0);
        expect(screen.getAllByText('GS-35F-0123X').length).toBeGreaterThan(0);
        expect(screen.getByText('W912DQ-23-D-0045')).toBeInTheDocument();
      });
    });
  });

  describe('Type Icons', () => {
    it('should display type icons after loading', async () => {
      render(<UpcomingDeadlines />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        // Check for emoji icons
        expect(screen.getByText('📊')).toBeInTheDocument(); // report
        expect(screen.getByText('💰')).toBeInTheDocument(); // invoice
        expect(screen.getByText('👥')).toBeInTheDocument(); // meeting
        expect(screen.getByText('📦')).toBeInTheDocument(); // deliverable
        expect(screen.getByText('🔍')).toBeInTheDocument(); // review
      });
    });
  });

  describe('Date Formatting', () => {
    it('should display formatted dates', async () => {
      render(<UpcomingDeadlines />);

      await vi.advanceTimersByTimeAsync(400);

      // Dates should be formatted like "Mon, Feb 5"
      await waitFor(() => {
        expect(screen.getByText(/Mon, Feb 5/)).toBeInTheDocument();
      });
    });
  });
});
