import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook, waitFor} from '@testing-library/react';
import {useContacts} from './useContacts';
import * as crmService from '../services/crmService';

vi.mock('../services/crmService');

const mockContacts = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        contactType: 'GOVERNMENT_CUSTOMER' as const,
        status: 'ACTIVE' as const,
        email: 'john@example.com',
        jobTitle: null,
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

describe('useContacts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(crmService.fetchContacts).mockResolvedValue({
            content: mockContacts,
            totalElements: 1,
            totalPages: 1,
            size: 20,
            number: 0,
        });
    });

    it('should load contacts on mount', async () => {
        const {result} = renderHook(() => useContacts());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.contacts).toHaveLength(1);
        expect(result.current.contacts.at(0)?.firstName).toBe('John');
    });

    it('should handle fetch error', async () => {
        vi.mocked(crmService.fetchContacts).mockRejectedValue(new Error('Network error'));

        const {result} = renderHook(() => useContacts());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toBe('Network error');
    });

    it('should update filters', async () => {
        const {result} = renderHook(() => useContacts());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.setFilters({contactType: 'VENDOR'});
        });

        await waitFor(() => {
            expect(crmService.fetchContacts).toHaveBeenCalledWith(
                0,
                20,
                expect.objectContaining({contactType: 'VENDOR'})
            );
        });
    });

    it('should create contact', async () => {
        const newContact = {...mockContacts[0], id: '2', firstName: 'Jane'};
        vi.mocked(crmService.createContact).mockResolvedValue(newContact);

        const {result} = renderHook(() => useContacts());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        let createdContact;
        await act(async () => {
            createdContact = await result.current.create({
                firstName: 'Jane',
                lastName: 'Doe',
                contactType: 'GOVERNMENT_CUSTOMER',
            });
        });

        expect(createdContact).toEqual(newContact);
        expect(result.current.contacts).toContainEqual(newContact);
    });

    it('should delete contact', async () => {
        vi.mocked(crmService.deleteContact).mockResolvedValue(undefined);

        const {result} = renderHook(() => useContacts());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
            await result.current.remove('1');
        });

        expect(crmService.deleteContact).toHaveBeenCalledWith('1');
        expect(result.current.contacts).not.toContainEqual(
            expect.objectContaining({id: '1'})
        );
    });

    it('should handle pagination', async () => {
        const {result} = renderHook(() => useContacts());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.setPage(1);
        });

        await waitFor(() => {
            expect(crmService.fetchContacts).toHaveBeenCalledWith(1, 20, expect.anything());
        });
    });
});
