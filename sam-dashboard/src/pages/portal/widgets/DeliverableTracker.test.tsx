import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DeliverableTracker } from './DeliverableTracker';

describe('DeliverableTracker', () => {
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

      await waitFor(
        () => {
          expect(screen.getByText('Monthly Status Report - January')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(screen.getByText('System Design Document v2.0')).toBeInTheDocument();
      expect(screen.getByText('Quarterly Financial Report')).toBeInTheDocument();
    });

    it('should display status labels', async () => {
      render(<DeliverableTracker />);

      await waitFor(
        () => {
          expect(screen.getAllByText('In Progress').length).toBeGreaterThan(0);
        },
        { timeout: 1000 }
      );

      expect(screen.getByText('In Review')).toBeInTheDocument();
      expect(screen.getByText('Not Started')).toBeInTheDocument();
    });
  });
});
