import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsListPage } from './ReportsListPage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

const mockReportsResponse = {
  content: [
    {
      id: '1',
      name: 'Test Report 1',
      description: 'Description 1',
      entityType: 'OPPORTUNITY',
      columns: [{ field: 'title', label: 'Title', width: 200, visible: true }],
      filters: [],
      sortBy: null,
      sortDirection: null,
      isPublic: false,
      runCount: 5,
      lastRunAt: '2024-01-15T10:00:00Z',
      createdByName: 'John Doe',
      createdById: 'user-1',
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
    },
    {
      id: '2',
      name: 'Test Report 2',
      description: null,
      entityType: 'CONTRACT',
      columns: [{ field: 'contractNumber', label: 'Contract Number', width: 150, visible: true }],
      filters: [],
      sortBy: null,
      sortDirection: null,
      isPublic: true,
      runCount: 10,
      lastRunAt: null,
      createdByName: 'Jane Smith',
      createdById: 'user-2',
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-05T10:00:00Z',
    },
  ],
  totalElements: 2,
  totalPages: 1,
  number: 0,
  size: 10,
};

describe('ReportsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({ accessToken: 'test-token' })
    );
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockReportsResponse),
    });
  });

  it('renders the page title', async () => {
    render(<ReportsListPage />);
    expect(await screen.findByText('Reports')).toBeInTheDocument();
  });

  it('renders the search input', async () => {
    render(<ReportsListPage />);
    expect(await screen.findByPlaceholderText('Search reports...')).toBeInTheDocument();
  });

  it('renders the data source filter', async () => {
    render(<ReportsListPage />);
    expect(await screen.findByText('All Sources')).toBeInTheDocument();
  });

  it('displays report list after loading', async () => {
    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Report 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Report 2')).toBeInTheDocument();
  });

  it('shows create report button when callback is provided', async () => {
    const onCreateReport = vi.fn();
    render(<ReportsListPage onCreateReport={onCreateReport} />);

    const createButton = await screen.findByRole('button', { name: /create report/i });
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateReport when create button is clicked', async () => {
    const user = userEvent.setup();
    const onCreateReport = vi.fn();
    render(<ReportsListPage onCreateReport={onCreateReport} />);

    const createButton = await screen.findByRole('button', { name: /create report/i });
    await user.click(createButton);

    expect(onCreateReport).toHaveBeenCalled();
  });

  it('displays run count for each report', async () => {
    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('displays public/private badges', async () => {
    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Private')).toBeInTheDocument();
    });
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('displays entity type badges', async () => {
    render(<ReportsListPage />);

    await waitFor(() => {
      // Use getAllByText because "Opportunities" appears in both the filter dropdown and the badge
      const opportunities = screen.getAllByText('Opportunities');
      expect(opportunities.length).toBeGreaterThan(0);
    });
    const contracts = screen.getAllByText('Contracts');
    expect(contracts.length).toBeGreaterThan(0);
  });

  it('shows loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<ReportsListPage />);

    expect(screen.getByText('Loading reports...')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch reports')).toBeInTheDocument();
    });
  });

  it('shows empty state when no reports exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
        }),
    });

    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('No reports found')).toBeInTheDocument();
    });
  });

  it('calls delete endpoint when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);

    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Report 1')).toBeInTheDocument();
    });

    // Find delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete report/i });
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this report?'
    );
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/report-definitions/1',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: 'Bearer test-token' },
      })
    );
  });

  it('does not delete when confirm is cancelled', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);

    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Report 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete report/i });
    const initialCallCount = mockFetch.mock.calls.length;
    await user.click(deleteButtons[0]);

    // Should not make additional fetch call for delete
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    render(<ReportsListPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Report 1')).toBeInTheDocument();
    });

    const searchInput = await screen.findByPlaceholderText('Search reports...');
    await user.type(searchInput, 'test');

    // Wait for search to be included in fetch call
    // Each keystroke triggers a new fetch, so we check that search parameter is included
    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const hasSearchCall = calls.some(
        (call: unknown[]) => typeof call[0] === 'string' && call[0].includes('search=')
      );
      expect(hasSearchCall).toBe(true);
    });
  });

  it('handles entity type filter', async () => {
    const user = userEvent.setup();
    render(<ReportsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Report 1')).toBeInTheDocument();
    });

    const filterSelect = screen.getByDisplayValue('All Sources');
    await user.selectOptions(filterSelect, 'OPPORTUNITY');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('entityType=OPPORTUNITY'),
        expect.anything()
      );
    });
  });
});
