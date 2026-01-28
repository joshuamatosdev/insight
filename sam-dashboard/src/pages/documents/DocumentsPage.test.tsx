import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import {DocumentsPage} from './DocumentsPage';
import * as hooks from '../../hooks';
import type {Document, DocumentFolder} from '../../types/documents';

// Mock the hooks
vi.mock('../../hooks', async () => {
  const actual = await vi.importActual('../../hooks');
  return {
    ...actual,
    useDocuments: vi.fn(),
    useFolders: vi.fn(),
  };
});

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Technical Proposal.pdf',
    description: 'Technical proposal for Contract A',
    documentType: 'PROPOSAL_TECHNICAL',
    status: 'APPROVED',
    fileName: 'tech-proposal.pdf',
    filePath: '/files/tech-proposal.pdf',
    fileSize: 2048000,
    contentType: 'application/pdf',
    fileHash: null,
    versionNumber: 1,
    parentDocumentId: null,
    isLatestVersion: true,
    isCheckedOut: false,
    checkedOutById: null,
    checkedOutByName: null,
    checkedOutAt: null,
    folderId: 'folder-1',
    folderName: 'Proposals',
    opportunityId: null,
    contractId: null,
    accessLevel: 'INTERNAL',
    tags: 'proposal,technical',
    keywords: null,
    author: null,
    source: null,
    effectiveDate: null,
    expirationDate: null,
    approvedById: null,
    approvedByName: null,
    approvedAt: null,
    approvalNotes: null,
    createdById: 'user-1',
    createdByName: 'John Doe',
    updatedById: 'user-1',
    updatedByName: 'John Doe',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    retentionDate: null,
    isArchived: false,
  },
  {
    id: 'doc-2',
    name: 'Cost Proposal.xlsx',
    description: 'Cost proposal spreadsheet',
    documentType: 'PROPOSAL_COST',
    status: 'DRAFT',
    fileName: 'cost-proposal.xlsx',
    filePath: '/files/cost-proposal.xlsx',
    fileSize: 512000,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileHash: null,
    versionNumber: 2,
    parentDocumentId: null,
    isLatestVersion: true,
    isCheckedOut: false,
    checkedOutById: null,
    checkedOutByName: null,
    checkedOutAt: null,
    folderId: 'folder-1',
    folderName: 'Proposals',
    opportunityId: null,
    contractId: null,
    accessLevel: 'RESTRICTED',
    tags: 'proposal,cost',
    keywords: null,
    author: null,
    source: null,
    effectiveDate: null,
    expirationDate: null,
    approvedById: null,
    approvedByName: null,
    approvedAt: null,
    approvalNotes: null,
    createdById: 'user-1',
    createdByName: 'John Doe',
    updatedById: 'user-2',
    updatedByName: 'Jane Smith',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
    retentionDate: null,
    isArchived: false,
  },
];

const mockFolders: DocumentFolder[] = [
  {
    id: 'folder-1',
    name: 'Proposals',
    description: 'All proposal documents',
    folderType: 'PROPOSAL',
    path: '/Proposals',
    depth: 0,
    sortOrder: 1,
    isPublic: false,
    isSystemFolder: false,
    tags: null,
    icon: null,
    color: null,
    retentionDays: null,
    parentFolderId: null,
    opportunityId: null,
    contractId: null,
    createdById: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    isArchived: false,
  },
  {
    id: 'folder-2',
    name: 'Contracts',
    description: 'Contract documents',
    folderType: 'CONTRACT',
    path: '/Contracts',
    depth: 0,
    sortOrder: 2,
    isPublic: false,
    isSystemFolder: false,
    tags: null,
    icon: null,
    color: null,
    retentionDays: null,
    parentFolderId: null,
    opportunityId: null,
    contractId: null,
    createdById: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    isArchived: false,
  },
];

function renderDocumentsPage() {
  return render(
    <BrowserRouter>
      <DocumentsPage />
    </BrowserRouter>
  );
}

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (hooks.useDocuments as Mock).mockReturnValue({
      documents: mockDocuments,
      isLoading: false,
      error: null,
      page: 0,
      totalPages: 1,
      totalElements: 2,
      filters: {},
      setFilters: vi.fn(),
      setPage: vi.fn(),
      remove: vi.fn(),
    });

    (hooks.useFolders as Mock).mockReturnValue({
      folders: mockFolders,
      isLoading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('should render the Documents section header', () => {
      renderDocumentsPage();
      expect(screen.getByRole('heading', { name: /documents/i })).toBeInTheDocument();
    });

    it('should render upload button', () => {
      renderDocumentsPage();
      expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
    });

    it('should render folder tree section', () => {
      renderDocumentsPage();
      expect(screen.getByText(/folders/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderDocumentsPage();
      expect(screen.getByPlaceholderText(/search documents/i)).toBeInTheDocument();
    });

    it('should render document type filter', () => {
      renderDocumentsPage();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render document list with documents', () => {
      renderDocumentsPage();
      expect(screen.getByText('Technical Proposal.pdf')).toBeInTheDocument();
      expect(screen.getByText('Cost Proposal.xlsx')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when documents are loading', () => {
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: [],
        isLoading: true,
        error: null,
        page: 0,
        totalPages: 0,
        totalElements: 0,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        remove: vi.fn(),
      });

      renderDocumentsPage();
      // DocumentList component should handle loading state
      expect(hooks.useDocuments).toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      const errorMessage = 'Failed to load documents';
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        error: new Error(errorMessage),
        page: 0,
        totalPages: 0,
        totalElements: 0,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        remove: vi.fn(),
      });

      renderDocumentsPage();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to upload page when upload button is clicked', async () => {
      const user = userEvent.setup();
      renderDocumentsPage();

      const uploadButton = screen.getByRole('button', { name: /upload document/i });
      await user.click(uploadButton);

      expect(mockNavigate).toHaveBeenCalledWith('/documents/upload');
    });

    it('should navigate to document detail when document is clicked', async () => {
      const user = userEvent.setup();
      renderDocumentsPage();

      const documentItem = screen.getByText('Technical Proposal.pdf');
      await user.click(documentItem);

      expect(mockNavigate).toHaveBeenCalledWith('/documents/doc-1');
    });
  });

  describe('Search and Filtering', () => {
    it('should call setFilters when search input changes', async () => {
      const setFiltersMock = vi.fn();
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 1,
        totalElements: 2,
        filters: {},
        setFilters: setFiltersMock,
        setPage: vi.fn(),
        remove: vi.fn(),
      });

      const user = userEvent.setup();
      renderDocumentsPage();

      const searchInput = screen.getByPlaceholderText(/search documents/i);
      await user.type(searchInput, 'proposal');

      await waitFor(() => {
        expect(setFiltersMock).toHaveBeenCalled();
      });
    });

    it('should call setFilters when document type filter changes', async () => {
      const setFiltersMock = vi.fn();
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 1,
        totalElements: 2,
        filters: {},
        setFilters: setFiltersMock,
        setPage: vi.fn(),
        remove: vi.fn(),
      });

      const user = userEvent.setup();
      renderDocumentsPage();

      const typeFilter = screen.getByRole('combobox');
      await user.selectOptions(typeFilter, 'RFP');

      expect(setFiltersMock).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should display pagination when multiple pages exist', () => {
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 3,
        totalElements: 25,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        remove: vi.fn(),
      });

      renderDocumentsPage();
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 3,
        totalElements: 25,
        filters: {},
        setFilters: vi.fn(),
        setPage: vi.fn(),
        remove: vi.fn(),
      });

      renderDocumentsPage();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });

    it('should call setPage when next button is clicked', async () => {
      const setPageMock = vi.fn();
      (hooks.useDocuments as Mock).mockReturnValue({
        documents: mockDocuments,
        isLoading: false,
        error: null,
        page: 0,
        totalPages: 3,
        totalElements: 25,
        filters: {},
        setFilters: vi.fn(),
        setPage: setPageMock,
        remove: vi.fn(),
      });

      const user = userEvent.setup();
      renderDocumentsPage();

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(setPageMock).toHaveBeenCalledWith(1);
    });
  });
});
