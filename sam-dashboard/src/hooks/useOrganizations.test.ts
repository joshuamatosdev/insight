import {beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook, waitFor} from '@testing-library/react';
import {useOrganizations} from './useOrganizations';
import * as crmService from '../services/crmService';

vi.mock('../services/crmService');

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
];

describe('useOrganizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(crmService.fetchOrganizations).mockResolvedValue({
      content: mockOrganizations,
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
    });
  });

  it('should load organizations on mount', async () => {
    const { result } = renderHook(() => useOrganizations());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.organizations).toHaveLength(1);
    expect(result.current.organizations.at(0)?.name).toBe('Acme Corp');
  });

  it('should handle fetch error', async () => {
    vi.mocked(crmService.fetchOrganizations).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useOrganizations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should filter by organization type', async () => {
    const { result } = renderHook(() => useOrganizations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setFilters({ organizationType: 'GOVERNMENT_AGENCY' });
    });

    await waitFor(() => {
      expect(crmService.fetchOrganizations).toHaveBeenCalledWith(
        0,
        20,
        expect.objectContaining({ organizationType: 'GOVERNMENT_AGENCY' })
      );
    });
  });

  it('should create organization', async () => {
    const newOrg = { ...mockOrganizations[0], id: '2', name: 'New Corp' };
    vi.mocked(crmService.createOrganization).mockResolvedValue(newOrg);

    const { result } = renderHook(() => useOrganizations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let createdOrg;
    await act(async () => {
      createdOrg = await result.current.create({
        name: 'New Corp',
        organizationType: 'VENDOR',
      });
    });

    expect(createdOrg).toEqual(newOrg);
    expect(result.current.organizations).toContainEqual(newOrg);
  });

  it('should delete organization', async () => {
    vi.mocked(crmService.deleteOrganization).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOrganizations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.remove('1');
    });

    expect(crmService.deleteOrganization).toHaveBeenCalledWith('1');
    expect(result.current.organizations).not.toContainEqual(
      expect.objectContaining({ id: '1' })
    );
  });

  it('should search organizations', async () => {
    vi.mocked(crmService.searchOrganizations).mockResolvedValue({
      content: [{ ...mockOrganizations[0], name: 'Found Org' }],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
    });

    const { result } = renderHook(() => useOrganizations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.search('Found');
    });

    expect(crmService.searchOrganizations).toHaveBeenCalledWith('Found', 0, 20);
    expect(result.current.organizations.at(0)?.name).toBe('Found Org');
  });
});
