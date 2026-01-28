import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RouterTestWrapper} from '@/test/router-test-utils';
import {OrganizationsPage} from './OrganizationsPage';
import * as crmService from '../../services/crmService';

vi.mock('../../services/crmService');

const mockOrganizations = [
    {
        id: '1',
        name: 'Acme Corp',
        organizationType: 'PRIME_CONTRACTOR' as const,
        status: 'ACTIVE' as const,
        uei: 'ACME123456789',
        cageCode: 'ABC12',
        city: 'Washington',
        state: 'DC',
        contactCount: 5,
        legalName: null,
        dbaName: null,
        businessSize: null,
        duns: null,
        taxId: null,
        agencyCode: null,
        parentAgency: null,
        naicsCodes: null,
        pscCodes: null,
        primaryNaics: null,
        phone: null,
        fax: null,
        email: null,
        website: null,
        addressLine1: null,
        addressLine2: null,
        postalCode: null,
        country: null,
        capabilities: null,
        coreCompetencies: null,
        pastPerformanceSummary: null,
        certifications: null,
        contractVehicles: null,
        relationshipTier: null,
        relationshipScore: null,
        annualRevenue: null,
        employeeCount: null,
        yearFounded: null,
        tags: null,
        notes: null,
        logoUrl: null,
        parentOrganizationId: null,
        parentOrganizationName: null,
        ownerId: null,
        ownerName: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Defense Agency',
        organizationType: 'GOVERNMENT_AGENCY' as const,
        status: 'ACTIVE' as const,
        uei: null,
        cageCode: null,
        city: 'Arlington',
        state: 'VA',
        contactCount: 12,
        legalName: null,
        dbaName: null,
        businessSize: null,
        duns: null,
        taxId: null,
        agencyCode: 'DOD001',
        parentAgency: 'DOD',
        naicsCodes: null,
        pscCodes: null,
        primaryNaics: null,
        phone: null,
        fax: null,
        email: null,
        website: null,
        addressLine1: null,
        addressLine2: null,
        postalCode: null,
        country: null,
        capabilities: null,
        coreCompetencies: null,
        pastPerformanceSummary: null,
        certifications: null,
        contractVehicles: null,
        relationshipTier: null,
        relationshipScore: null,
        annualRevenue: null,
        employeeCount: null,
        yearFounded: null,
        tags: null,
        notes: null,
        logoUrl: null,
        parentOrganizationId: null,
        parentOrganizationName: null,
        ownerId: null,
        ownerName: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

function renderWithRouter(component: React.ReactNode) {
    return render(<RouterTestWrapper>{component}</RouterTestWrapper>);
}

describe('OrganizationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(crmService.fetchOrganizations).mockResolvedValue({
            content: mockOrganizations,
            totalElements: 2,
            totalPages: 1,
            size: 20,
            number: 0,
        });
    });

    it('should render organizations page heading', async () => {
        renderWithRouter(<OrganizationsPage/>);

        await waitFor(() => {
            expect(screen.getByRole('heading', {name: /organizations/i})).toBeInTheDocument();
        });
    });

    it('should render organization list after loading', async () => {
        renderWithRouter(<OrganizationsPage/>);

        await waitFor(() => {
            expect(screen.getByText('Acme Corp')).toBeInTheDocument();
            expect(screen.getByText('Defense Agency')).toBeInTheDocument();
        });
    });

    it('should show add organization button', async () => {
        renderWithRouter(<OrganizationsPage/>);

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /add organization/i})).toBeInTheDocument();
        });
    });

    it('should have search input', async () => {
        renderWithRouter(<OrganizationsPage/>);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/search organizations/i)).toBeInTheDocument();
        });
    });

    it('should show create form when add button is clicked', async () => {
        const user = userEvent.setup();
        renderWithRouter(<OrganizationsPage/>);

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /add organization/i})).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', {name: /add organization/i}));

        await waitFor(() => {
            expect(screen.getByRole('heading', {name: /new organization/i})).toBeInTheDocument();
        });
    });

    it('should display organization type badges', async () => {
        renderWithRouter(<OrganizationsPage/>);

        await waitFor(() => {
            expect(screen.getByText('Prime Contractor')).toBeInTheDocument();
            expect(screen.getByText('Government Agency')).toBeInTheDocument();
        });
    });
});
