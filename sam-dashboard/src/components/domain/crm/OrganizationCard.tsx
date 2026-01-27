import { Card, CardHeader, CardBody } from '../../catalyst/layout/Card';
import { HStack, Stack } from '../../catalyst/layout/Stack';
import { Text } from '../../catalyst/primitives/Text';
import { Badge } from '../../catalyst/primitives/Badge';
import { Button } from '../../catalyst/primitives/Button';
import type { OrganizationCardProps } from './OrganizationCard.types';
import type { OrganizationType, OrganizationStatus } from '../../../types/crm';

function getOrgTypeLabel(type: OrganizationType): string {
  const labels: Record<OrganizationType, string> = {
    GOVERNMENT_AGENCY: 'Government Agency',
    GOVERNMENT_OFFICE: 'Government Office',
    PRIME_CONTRACTOR: 'Prime Contractor',
    SUBCONTRACTOR: 'Subcontractor',
    TEAMING_PARTNER: 'Teaming Partner',
    VENDOR: 'Vendor',
    COMPETITOR: 'Competitor',
    PROSPECT: 'Prospect',
    CUSTOMER: 'Customer',
    OTHER: 'Other',
  };
  return labels[type];
}

function getOrgTypeVariant(type: OrganizationType): 'blue' | 'green' | 'yellow' | 'red' | 'gray' {
  if (type === 'GOVERNMENT_AGENCY' || type === 'GOVERNMENT_OFFICE') {
    return 'blue';
  }
  if (type === 'PRIME_CONTRACTOR' || type === 'CUSTOMER') {
    return 'green';
  }
  if (type === 'PROSPECT') {
    return 'yellow';
  }
  if (type === 'COMPETITOR') {
    return 'red';
  }
  return 'gray';
}

function getStatusVariant(status: OrganizationStatus): 'green' | 'gray' | 'red' | 'yellow' {
  const variants: Record<OrganizationStatus, 'green' | 'gray' | 'red' | 'yellow'> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    PROSPECT: 'yellow',
    DO_NOT_CONTACT: 'red',
    ARCHIVED: 'gray',
  };
  return variants[status];
}

export function OrganizationCard({
  organization,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
}: OrganizationCardProps) {
  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(organization);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(organization);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete !== undefined) {
      onDelete(organization);
    }
  };

  return (
    <Card onClick={onClick !== undefined ? handleClick : undefined}>
      <CardHeader>
        <HStack justify="between" align="center">
          <Text variant="heading5">{organization.name}</Text>
          <HStack gap="sm">
            <Badge color={getOrgTypeVariant(organization.organizationType)}>
              {getOrgTypeLabel(organization.organizationType)}
            </Badge>
            <Badge color={getStatusVariant(organization.status)}>
              {organization.status}
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <HStack justify="between" align="start">
          <Stack gap="xs">
            {organization.uei !== null && (
              <Text variant="bodySmall" color="secondary">
                UEI: {organization.uei}
              </Text>
            )}
            {organization.cageCode !== null && (
              <Text variant="bodySmall" color="secondary">
                CAGE: {organization.cageCode}
              </Text>
            )}
            {organization.city !== null && organization.state !== null && (
              <Text variant="bodySmall" color="secondary">
                {organization.city}, {organization.state}
              </Text>
            )}
            {organization.contactCount > 0 && (
              <Text variant="bodySmall" color="primary">
                {organization.contactCount} contact{organization.contactCount !== 1 ? 's' : ''}
              </Text>
            )}
          </Stack>
          {showActions === true && (onEdit !== undefined || onDelete !== undefined) && (
            <HStack gap="sm">
              {onEdit !== undefined && (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  Edit
                </Button>
              )}
              {onDelete !== undefined && (
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </HStack>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
}
