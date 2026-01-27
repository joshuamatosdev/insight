import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DeliverableTracker } from './DeliverableTracker';

describe('DeliverableTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Header', () => {
    it('should render the widget title', () => {
      render(<DeliverableTracker />);

      expect(screen.getByText('Deliverable Tracker')).toBeInTheDocument();
    });

    it('should render View All button', () => {
      render(<DeliverableTracker />);

      expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading text initially', () => {
      render(<DeliverableTracker />);

      expect(screen.getByText('Loading deliverables...')).toBeInTheDocument();
    });
  });

  describe('Deliverable Display', () => {
    it('should display deliverable titles after loading', async () => {
      render(<DeliverableTracker />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('Monthly Status Report - January')).toBeInTheDocument();
        expect(screen.getByText('System Design Document v2.0')).toBeInTheDocument();
        expect(screen.getByText('Quarterly Financial Report')).toBeInTheDocument();
        expect(screen.getByText('Security Assessment Report')).toBeInTheDocument();
      });
    });

    it('should display contract numbers', async () => {
      render(<DeliverableTracker />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getAllByText('FA8773-24-C-0001').length).toBeGreaterThan(0);
        expect(screen.getByText('GS-35F-0123X')).toBeInTheDocument();
        expect(screen.getByText('W912DQ-23-D-0045')).toBeInTheDocument();
      });
    });

    it('should display due dates', async () => {
      render(<DeliverableTracker />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText(/Due 2024-02-05/)).toBeInTheDocument();
        expect(screen.getByText(/Due 2024-02-10/)).toBeInTheDocument();
        expect(screen.getByText(/Due 2024-02-15/)).toBeInTheDocument();
        expect(screen.getByText(/Due 2024-02-20/)).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    it('should display status labels', async () => {
      render(<DeliverableTracker />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
        expect(screen.getByText('In Review')).toBeInTheDocument();
        expect(screen.getByText('Not Started')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Display', () => {
    it('should render progress bars for deliverables', async () => {
      render(<DeliverableTracker />);

      await vi.advanceTimersByTimeAsync(400);

      // After loading, there should be deliverables displayed
      await waitFor(() => {
        expect(screen.getByText('Monthly Status Report - January')).toBeInTheDocument();
      });
    });
  });
});
