import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ReportBuilderPage} from './ReportBuilderPage';

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

describe('ReportBuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({ accessToken: 'test-token' })
    );
  });

  it('renders the page title', () => {
    render(<ReportBuilderPage />);
    expect(screen.getByText('Create Report')).toBeInTheDocument();
  });

  it('renders the data source selector', () => {
    render(<ReportBuilderPage />);
    expect(screen.getByText('Data Source')).toBeInTheDocument();
    expect(screen.getByText('Select data source...')).toBeInTheDocument();
  });

  it('shows edit mode title when reportId is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: '123',
          name: 'Test Report',
          description: 'Test Description',
          entityType: 'OPPORTUNITY',
          columns: [{ field: 'title', label: 'Title', width: 200, visible: true }],
          filters: [],
          sortBy: null,
          sortDirection: null,
          isPublic: false,
        }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { field: 'title', label: 'Title', width: 200, visible: true },
          { field: 'type', label: 'Type', width: 100, visible: true },
        ]),
    });

    render(<ReportBuilderPage reportId="123" />);

    expect(await screen.findByText('Edit Report')).toBeInTheDocument();
  });

  it('shows preview button when entity type and columns are selected', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { field: 'title', label: 'Title', width: 200, visible: true },
          { field: 'type', label: 'Type', width: 100, visible: true },
        ]),
    });

    render(<ReportBuilderPage />);

    // Select entity type
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'OPPORTUNITY');

    // Preview button should be disabled until columns are selected
    const previewButton = screen.getByRole('button', { name: /preview/i });
    expect(previewButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<ReportBuilderPage onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('shows save dialog when save button is clicked', async () => {
    const user = userEvent.setup();

    render(<ReportBuilderPage />);

    const saveButton = screen.getByRole('button', { name: /save report/i });
    await user.click(saveButton);

    expect(screen.getByText('Report Name *')).toBeInTheDocument();
  });

  it('fetches columns when entity type is selected', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { field: 'title', label: 'Title', width: 200, visible: true },
          { field: 'type', label: 'Type', width: 100, visible: true },
        ]),
    });

    render(<ReportBuilderPage />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'OPPORTUNITY');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/report-definitions/columns/OPPORTUNITY',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      })
    );
  });

  it('shows available and selected columns sections', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { field: 'title', label: 'Title', width: 200, visible: true },
          { field: 'type', label: 'Type', width: 100, visible: true },
        ]),
    });

    render(<ReportBuilderPage />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'OPPORTUNITY');

    expect(await screen.findByText('Available Columns')).toBeInTheDocument();
    expect(screen.getByText('Selected Columns')).toBeInTheDocument();
  });
});
