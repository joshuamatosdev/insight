import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ContactCard} from './ContactCard';
import type {Contact} from '../../../types/crm';

const mockContact: Contact = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    contactType: 'GOVERNMENT_CUSTOMER',
    status: 'ACTIVE',
    email: 'john.doe@example.com',
    jobTitle: 'Program Manager',
    department: 'IT',
    phoneWork: '555-123-4567',
    phoneMobile: null,
    organizationName: 'Test Agency',
    organizationId: 'org-1',
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
};

describe('ContactCard', () => {
    it('should render contact name', () => {
        render(<ContactCard contact={mockContact}/>);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render contact type badge', () => {
        render(<ContactCard contact={mockContact}/>);

        expect(screen.getByText('Government Customer')).toBeInTheDocument();
    });

    it('should render status badge', () => {
        render(<ContactCard contact={mockContact}/>);

        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });

    it('should render job title when present', () => {
        render(<ContactCard contact={mockContact}/>);

        expect(screen.getByText('Program Manager')).toBeInTheDocument();
    });

    it('should render organization name when present', () => {
        render(<ContactCard contact={mockContact}/>);

        expect(screen.getByText('Test Agency')).toBeInTheDocument();
    });

    it('should render email when present', () => {
        render(<ContactCard contact={mockContact}/>);

        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('should call onClick when card is clicked', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<ContactCard contact={mockContact} onClick={handleClick}/>);

        await user.click(screen.getByText('John Doe'));

        expect(handleClick).toHaveBeenCalledWith(mockContact);
    });

    it('should call onEdit when edit button is clicked', async () => {
        const user = userEvent.setup();
        const handleEdit = vi.fn();

        render(<ContactCard contact={mockContact} onEdit={handleEdit}/>);

        await user.click(screen.getByRole('button', {name: /edit/i}));

        expect(handleEdit).toHaveBeenCalledWith(mockContact);
    });

    it('should call onDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        const handleDelete = vi.fn();

        render(<ContactCard contact={mockContact} onDelete={handleDelete}/>);

        await user.click(screen.getByRole('button', {name: /delete/i}));

        expect(handleDelete).toHaveBeenCalledWith(mockContact);
    });

    it('should hide action buttons when showActions is false', () => {
        render(
            <ContactCard
                contact={mockContact}
                onEdit={vi.fn()}
                onDelete={vi.fn()}
                showActions={false}
            />
        );

        expect(screen.queryByRole('button', {name: /edit/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /delete/i})).not.toBeInTheDocument();
    });

    it('should not render job title when null', () => {
        const contactWithoutTitle = {...mockContact, jobTitle: null};
        render(<ContactCard contact={contactWithoutTitle}/>);

        expect(screen.queryByText('Program Manager')).not.toBeInTheDocument();
    });

    it('should render different contact types correctly', () => {
        const coContact: Contact = {...mockContact, contactType: 'CONTRACTING_OFFICER'};
        const {rerender} = render(<ContactCard contact={coContact}/>);
        expect(screen.getByText('Contracting Officer')).toBeInTheDocument();

        const vendorContact: Contact = {...mockContact, contactType: 'VENDOR'};
        rerender(<ContactCard contact={vendorContact}/>);
        expect(screen.getByText('Vendor')).toBeInTheDocument();
    });
});
