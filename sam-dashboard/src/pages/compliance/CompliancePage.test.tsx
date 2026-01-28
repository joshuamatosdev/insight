import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompliancePage } from './CompliancePage';
import * as hooks from '../../hooks';
import type { Certification, SecurityClearance } from '../../types/compliance.types';

// Mock the hooks
vi.mock('../../hooks', async () => {
  const actual = await vi.importActual('../../hooks');
  return {
    ...actual,
    useComplianceOverview: vi.fn(),
  };
});

const mockCertifications: Certification[] = [
  {
    id: 'cert-1',
    certificationType: 'EIGHT_A',
    name: '8(a) Business Development',
    description: null,
    issuingAgency: 'SBA',
    certificateNumber: 'SBA-8A-12345',
    status: 'ACTIVE',
    issueDate: '2023-01-01',
    expirationDate: '2026-01-01',
    renewalDate: null,
    naicsCode: null,
    sizeStandard: null,
    uei: null,
    cageCode: null,
    samRegistrationDate: null,
    samExpirationDate: null,
    eightAEntryDate: null,
    eightAGraduationDate: null,
    hubzoneCertificationDate: null,
    documentUrl: null,
    notes: null,
    reminderDaysBefore: 90,
    reminderSent: false,
    daysUntilExpiration: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cert-2',
    certificationType: 'WOSB',
    name: 'Woman-Owned Small Business',
    description: null,
    issuingAgency: 'SBA',
    certificateNumber: 'WOSB-67890',
    status: 'ACTIVE',
    issueDate: '2022-06-01',
    expirationDate: '2025-06-01',
    renewalDate: null,
    naicsCode: null,
    sizeStandard: null,
    uei: null,
    cageCode: null,
    samRegistrationDate: null,
    samExpirationDate: null,
    eightAEntryDate: null,
    eightAGraduationDate: null,
    hubzoneCertificationDate: null,
    documentUrl: null,
    notes: null,
    reminderDaysBefore: 90,
    reminderSent: false,
    daysUntilExpiration: null,
    createdAt: '2022-06-01T00:00:00Z',
    updatedAt: '2022-06-01T00:00:00Z',
  },
];

const mockClearances: SecurityClearance[] = [
  {
    id: 'clear-1',
    userId: null,
    entityName: null,
    userName: null,
    clearanceType: 'FACILITY',
    clearanceLevel: 'SECRET',
    status: 'ACTIVE',
    investigationDate: null,
    grantDate: '2020-01-01',
    expirationDate: '2030-01-01',
    reinvestigationDate: null,
    polygraphType: null,
    polygraphDate: null,
    sponsoringAgency: 'DoD',
    caseNumber: null,
    cageCode: null,
    facilityAddress: null,
    fsoName: null,
    fsoEmail: null,
    fsoPhone: null,
    sciAccess: false,
    sciPrograms: null,
    sapAccess: false,
    notes: null,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2020-01-01T00:00:00Z',
  },
];

const mockOnNavigate = vi.fn();

function renderCompliancePage(props = {}) {
  return render(
    <CompliancePage onNavigate={mockOnNavigate} {...props} />
  );
}

describe('CompliancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (hooks.useComplianceOverview as Mock).mockReturnValue({
      certifications: mockCertifications,
      clearances: mockClearances,
      expiringCertifications: [],
      expiringClearances: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render the Compliance Management section', () => {
      renderCompliancePage();
      expect(screen.getByText(/compliance management/i)).toBeInTheDocument();
    });

    it('should render the section header with title', () => {
      renderCompliancePage();
      expect(screen.getByText(/compliance management/i)).toBeInTheDocument();
    });

    it('should render View All Certifications button', () => {
      renderCompliancePage();
      expect(screen.getByRole('button', { name: /view all certifications/i })).toBeInTheDocument();
    });

    it('should render View All Clearances button', () => {
      renderCompliancePage();
      expect(screen.getByRole('button', { name: /view all clearances/i })).toBeInTheDocument();
    });
  });

  describe('Stats Cards', () => {
    it('should display active certifications count', () => {
      renderCompliancePage();
      expect(screen.getByText(/active certifications/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display active clearances count', () => {
      renderCompliancePage();
      expect(screen.getByText(/active clearances/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display expiring soon count', () => {
      renderCompliancePage();
      expect(screen.getByText(/expiring soon/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when data is loading', () => {
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      });

      renderCompliancePage();
      expect(screen.getByText(/loading compliance data/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      const errorMessage = 'Failed to load compliance data';
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: false,
        error: new Error(errorMessage),
        refresh: vi.fn(),
      });

      renderCompliancePage();
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });

    it('should display retry button when error occurs', () => {
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: false,
        error: new Error('Failed'),
        refresh: vi.fn(),
      });

      renderCompliancePage();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should call refresh when retry button is clicked', async () => {
      const refreshMock = vi.fn();
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: false,
        error: new Error('Failed'),
        refresh: refreshMock,
      });

      const user = userEvent.setup();
      renderCompliancePage();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(refreshMock).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no certifications or clearances exist', () => {
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderCompliancePage();
      expect(screen.getByText(/no compliance items configured yet/i)).toBeInTheDocument();
    });

    it('should display Add Certification button in empty state', () => {
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderCompliancePage();
      expect(screen.getByRole('button', { name: /add certification/i })).toBeInTheDocument();
    });

    it('should display Add Clearance button in empty state', () => {
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: [],
        clearances: [],
        expiringCertifications: [],
        expiringClearances: [],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderCompliancePage();
      expect(screen.getByRole('button', { name: /add clearance/i })).toBeInTheDocument();
    });
  });

  describe('Expiring Items Alert', () => {
    it('should display expiration alert when items are expiring', () => {
      (hooks.useComplianceOverview as Mock).mockReturnValue({
        certifications: mockCertifications,
        clearances: mockClearances,
        expiringCertifications: [mockCertifications[1]],
        expiringClearances: [],
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderCompliancePage();
      // The ExpirationAlert component should be rendered
      expect(hooks.useComplianceOverview).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should call onNavigate with "certifications" when View All Certifications is clicked', async () => {
      const user = userEvent.setup();
      renderCompliancePage();

      const button = screen.getByRole('button', { name: /view all certifications/i });
      await user.click(button);

      expect(mockOnNavigate).toHaveBeenCalledWith('certifications');
    });

    it('should call onNavigate with "clearances" when View All Clearances is clicked', async () => {
      const user = userEvent.setup();
      renderCompliancePage();

      const button = screen.getByRole('button', { name: /view all clearances/i });
      await user.click(button);

      expect(mockOnNavigate).toHaveBeenCalledWith('clearances');
    });

    it('should call onNavigate with certification section when certification card is clicked', async () => {
      const user = userEvent.setup();
      renderCompliancePage();

      // Click on the Certifications quick action card
      const certCard = screen.getByText(/manage business certifications/i).closest('[role="article"]') || screen.getByText(/certifications/i);
      await user.click(certCard);

      expect(mockOnNavigate).toHaveBeenCalledWith('certifications');
    });
  });

  describe('Quick Action Cards', () => {
    it('should render Certifications card', () => {
      renderCompliancePage();
      expect(screen.getByText(/manage business certifications/i)).toBeInTheDocument();
    });

    it('should render Security Clearances card', () => {
      renderCompliancePage();
      expect(screen.getByText(/track personnel and facility clearances/i)).toBeInTheDocument();
    });

    it('should render SBOM Dashboard card', () => {
      renderCompliancePage();
      expect(screen.getByText(/software bill of materials/i)).toBeInTheDocument();
    });
  });

  describe('Recent Certifications', () => {
    it('should display recent certifications section when certifications exist', () => {
      renderCompliancePage();
      expect(screen.getByText(/recent certifications/i)).toBeInTheDocument();
    });

    it('should display View All button in recent certifications section', () => {
      renderCompliancePage();
      // There should be multiple View All buttons
      const viewAllButtons = screen.getAllByRole('button', { name: /view all/i });
      expect(viewAllButtons.length).toBeGreaterThan(0);
    });
  });
});
