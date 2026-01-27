import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, SectionHeader } from '../../components/layout/Section';
import { Stack, HStack } from '../../components/layout/Stack';
import { Input } from '../../components/primitives/Input';
import { Select } from '../../components/primitives/Input';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { OrganizationList, OrganizationForm } from '../../components/domain/crm';
import { useOrganizations } from '../../hooks';
import type { Organization, OrganizationType, CreateOrganizationRequest } from '../../types/crm';

const ORG_TYPE_OPTIONS: { value: OrganizationType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'GOVERNMENT_AGENCY', label: 'Government Agency' },
  { value: 'GOVERNMENT_OFFICE', label: 'Government Office' },
  { value: 'PRIME_CONTRACTOR', label: 'Prime Contractor' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
  { value: 'TEAMING_PARTNER', label: 'Teaming Partner' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'COMPETITOR', label: 'Competitor' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'OTHER', label: 'Other' },
];

export function OrganizationsPage() {
  const navigate = useNavigate();
  const {
    organizations,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    filters,
    setFilters,
    setPage,
    create,
    update,
    remove,
    refresh,
  } = useOrganizations();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === '') {
      const { organizationType: _unused, ...rest } = filters;
      void _unused;
      setFilters(rest);
    } else {
      setFilters({ ...filters, organizationType: value as OrganizationType });
    }
  };

  const handleOrgClick = (org: Organization) => {
    navigate(`/crm/organizations/${org.id}`);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
  };

  const handleDelete = async (org: Organization) => {
    if (window.confirm(`Are you sure you want to delete ${org.name}?`) === true) {
      try {
        await remove(org.id);
      } catch (err) {
        console.error('Failed to delete organization:', err);
      }
    }
  };

  const handleCreateSubmit = async (data: CreateOrganizationRequest) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setShowCreateForm(false);
      await refresh();
    } catch (err) {
      console.error('Failed to create organization:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: CreateOrganizationRequest) => {
    if (editingOrg === null) return;
    setIsSubmitting(true);
    try {
      await update(editingOrg.id, data);
      setEditingOrg(null);
      await refresh();
    } catch (err) {
      console.error('Failed to update organization:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingOrg(null);
  };

  if (showCreateForm === true) {
    return (
      <Section id="create-organization">
        <OrganizationForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </Section>
    );
  }

  if (editingOrg !== null) {
    return (
      <Section id="edit-organization">
        <OrganizationForm
          organization={editingOrg}
          onSubmit={handleEditSubmit}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      </Section>
    );
  }

  return (
    <Section id="organizations">
      <SectionHeader 
        title="Organizations"
        actions={<Button onClick={() => setShowCreateForm(true)}>Add Organization</Button>}
      />

      <Stack gap="lg">
        <HStack gap="md">
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <Select
            value={filters.organizationType ?? ''}
            onChange={(e) => handleTypeFilterChange(e.target.value)}
            options={ORG_TYPE_OPTIONS}
          />
        </HStack>

        {error !== null && (
          <Text variant="body" color="danger">
            {error.message}
          </Text>
        )}

        <OrganizationList
          organizations={organizations}
          isLoading={isLoading}
          onOrganizationClick={handleOrgClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {totalPages > 1 && (
          <HStack justify="between" align="center">
            <Text variant="bodySmall" color="secondary">
              Showing {organizations.length} of {totalElements} organizations
            </Text>
            <HStack gap="sm">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Text variant="bodySmall">
                Page {page + 1} of {totalPages}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        )}
      </Stack>
    </Section>
  );
}
