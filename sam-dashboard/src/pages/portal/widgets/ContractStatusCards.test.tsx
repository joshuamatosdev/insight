import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContractStatusCards } from './ContractStatusCards';

describe('ContractStatusCards', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Header', () => {
    it('should render the widget title', () => {
      render(<ContractStatusCards />);

      expect(screen.getByText('Active Contracts')).toBeInTheDocument();
    });

    it('should render View All button', () => {
      render(<ContractStatusCards />);

      expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading text initially', () => {
      render(<ContractStatusCards />);

      expect(screen.getByText('Loading contracts...')).toBeInTheDocument();
    });

    it('should not show contracts during loading', () => {
      render(<ContractStatusCards />);

      expect(screen.queryByText('FA8773-24-C-0001')).not.toBeInTheDocument();
    });
  });

  describe('Contract Display', () => {
    it('should display contracts after loading', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('FA8773-24-C-0001')).toBeInTheDocument();
        expect(screen.getByText('W912DQ-23-D-0045')).toBeInTheDocument();
        expect(screen.getByText('GS-35F-0123X')).toBeInTheDocument();
      });
    });

    it('should display contract titles', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('IT Infrastructure Support')).toBeInTheDocument();
        expect(screen.getByText('Engineering Services')).toBeInTheDocument();
        expect(screen.getByText('Software Development')).toBeInTheDocument();
      });
    });

    it('should display contract values formatted as currency', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('$850,000')).toBeInTheDocument();
        expect(screen.getByText('$1,200,000')).toBeInTheDocument();
        expect(screen.getByText('$400,000')).toBeInTheDocument();
      });
    });

    it('should display contract end dates', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText(/Ends 2025-12-31/)).toBeInTheDocument();
        expect(screen.getByText(/Ends 2024-06-30/)).toBeInTheDocument();
        expect(screen.getByText(/Ends 2025-03-15/)).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    it('should display status badges', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        // Check for status text (uppercase)
        expect(screen.getAllByText(/active/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/at-risk/i)).toBeInTheDocument();
      });
    });
  });

  describe('Progress Display', () => {
    it('should display progress percentages', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText('88%')).toBeInTheDocument();
        expect(screen.getByText('45%')).toBeInTheDocument();
      });
    });

    it('should display Progress label for each contract', async () => {
      render(<ContractStatusCards />);

      await vi.advanceTimersByTimeAsync(400);

      await waitFor(() => {
        const progressLabels = screen.getAllByText('Progress');
        expect(progressLabels.length).toBe(3);
      });
    });
  });
});
