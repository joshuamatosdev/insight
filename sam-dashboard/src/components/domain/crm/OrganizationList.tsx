import {Stack} from '../../catalyst/layout';
import {Text} from '../../catalyst/primitives';
import {OrganizationCard} from './OrganizationCard';
import type {Organization} from '../../../types/crm';

export interface OrganizationListProps {
  organizations: Organization[];
  isLoading: boolean;
  onOrganizationClick?: (organization: Organization) => void;
  onEdit?: (organization: Organization) => void;
  onDelete?: (organization: Organization) => void;
  emptyMessage?: string;
}

export function OrganizationList({
  organizations,
  isLoading,
  onOrganizationClick,
  onEdit,
  onDelete,
  emptyMessage = 'No organizations found',
}: OrganizationListProps) {
  if (isLoading === true) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">Loading organizations...</Text>
      </Stack>
    );
  }

  if (organizations.length === 0) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">{emptyMessage}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          organization={org}
          onClick={onOrganizationClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
