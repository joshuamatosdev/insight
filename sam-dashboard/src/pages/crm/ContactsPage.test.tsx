import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RouterTestWrapper} from '@/test/router-test-utils';
import {ContactsPage} from './ContactsPage';
import * as crmService from '../../services/crmService';

vi.mock('../../services/crmService');

const mockContacts = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        contactType: 'GOVERNMENT_CUSTOMER' as const,
        status: 'ACTIVE' as const,
        email: 'john.doe@example.com',
        jobTitle: 'Program Manager',
        department: null,
        phoneWork: null,
        phoneMobile: null,
        organizationName: 'Test Agency',
        organizationId: null,
        middleName: null,
        prefix: null,
        suffix: null,
        nickname: null,
        roleDescription: null,
        emailSecondary: null,
        phoneFax: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        linkedinUrl: null,
        website: null,
        preferredContactMethod: null,
        bestTimeToContact: null,
        timezone: null,
        tags: null,
        notes: null,
        relationshipScore: null,
        lastContactDate: null,
        nextFollowupDate: null,
        followupNotes: null,
        source: null,
        referralSource: null,
        photoUrl: null,
        ownerId: null,
        ownerName: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        contactType: 'CONTRACTING_OFFICER' as const,
        status: 'ACTIVE' as const,
        email: 'jane.smith@example.com',
        jobTitle: 'Contracting Officer',
        department: null,
        phoneWork: null,
        phoneMobile: null,
        organizationName: null,
        organizationId: null,
        middleName: null,
        prefix: null,
        suffix: null,
        nickname: null,
        roleDescription: null,
        emailSecondary: null,
        phoneFax: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        linkedinUrl: null,
        website: null,
        preferredContactMethod: null,
        bestTimeToContact: null,
        timezone: null,
        tags: null,
        notes: null,
        relationshipScore: null,
        lastContactDate: null,
        nextFollowupDate: null,
        followupNotes: null,
        source: null,
        referralSource: null,
        photoUrl: null,
        ownerId: null,
        ownerName: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
];

function renderWithRouter(component: React.ReactNode) {
    return render(<RouterTestWrapper>{component}</RouterTestWrapper>);
}

describe('ContactsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(crmService.fetchContacts).mockResolvedValue({
            content: mockContacts,
            totalElements: 2,
            totalPages: 1,
            size: 20,
            number: 0,
        });
    });

    it('should render contacts page heading', async () => {
        renderWithRouter(<ContactsPage/>);

        await waitFor(() => {
            expect(screen.getByRole('heading', {name: /contacts/i})).toBeInTheDocument();
        });
    });

    it('should render contact list after loading', async () => {
        renderWithRouter(<ContactsPage/>);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    it('should show add contact button', async () => {
        renderWithRouter(<ContactsPage/>);

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /add contact/i})).toBeInTheDocument();
        });
    });

    it('should have search input', async () => {
        renderWithRouter(<ContactsPage/>);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/search contacts/i)).toBeInTheDocument();
        });
    });

    it('should show create form when add button is clicked', async () => {
        const user = userEvent.setup();
        renderWithRouter(<ContactsPage/>);

        await waitFor(() => {
            expect(screen.getByRole('button', {name: /add contact/i})).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', {name: /add contact/i}));

        await waitFor(() => {
            expect(screen.getByRole('heading', {name: /new contact/i})).toBeInTheDocument();
        });
    });
});
