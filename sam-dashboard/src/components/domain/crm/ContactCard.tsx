import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {Badge, Button, Text} from '../../catalyst/primitives';
import type {ContactCardProps} from './ContactCard.types';
import type {ContactStatus, ContactType} from '../../../types/crm';

function getContactTypeLabel(type: ContactType): string {
  const labels: Record<ContactType, string> = {
    GOVERNMENT_CUSTOMER: 'Government Customer',
    CONTRACTING_OFFICER: 'Contracting Officer',
    CONTRACTING_SPECIALIST: 'Contracting Specialist',
    PROGRAM_MANAGER: 'Program Manager',
    TECHNICAL_POC: 'Technical POC',
    COR: 'COR',
    PRIME_CONTRACTOR: 'Prime Contractor',
    SUBCONTRACTOR: 'Subcontractor',
    TEAMING_PARTNER: 'Teaming Partner',
    VENDOR: 'Vendor',
    CONSULTANT: 'Consultant',
    PROSPECT: 'Prospect',
    INTERNAL: 'Internal',
    OTHER: 'Other',
  };
  return labels[type];
}

function getContactTypeVariant(type: ContactType): 'blue' | 'green' | 'yellow' | 'purple' | 'gray' {
  if (type === 'GOVERNMENT_CUSTOMER' || type === 'CONTRACTING_OFFICER' || type === 'CONTRACTING_SPECIALIST') {
    return 'blue';
  }
  if (type === 'PRIME_CONTRACTOR' || type === 'SUBCONTRACTOR' || type === 'TEAMING_PARTNER') {
    return 'green';
  }
  if (type === 'PROSPECT') {
    return 'yellow';
  }
  if (type === 'INTERNAL') {
    return 'purple';
  }
  return 'gray';
}

function getStatusVariant(status: ContactStatus): 'green' | 'gray' | 'red' | 'yellow' {
  const variants: Record<ContactStatus, 'green' | 'gray' | 'red' | 'yellow'> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    DO_NOT_CONTACT: 'red',
    ARCHIVED: 'gray',
  };
  return variants[status];
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
}: ContactCardProps) {
  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(contact);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(contact);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete !== undefined) {
      onDelete(contact);
    }
  };

  return (
    <Card onClick={onClick !== undefined ? handleClick : undefined}>
      <CardHeader>
        <HStack justify="between" align="center">
          <Text variant="heading5">
            {contact.firstName} {contact.lastName}
          </Text>
          <HStack gap="sm">
            <Badge color={getContactTypeVariant(contact.contactType)}>
              {getContactTypeLabel(contact.contactType)}
            </Badge>
            <Badge color={getStatusVariant(contact.status)}>
              {contact.status}
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <HStack justify="between" align="start">
          <Stack gap="xs">
            {contact.jobTitle !== null && (
              <Text variant="bodySmall" color="secondary">
                {contact.jobTitle}
              </Text>
            )}
            {contact.organizationName !== null && (
              <Text variant="bodySmall" color="secondary">
                {contact.organizationName}
              </Text>
            )}
            {contact.email !== null && (
              <Text variant="bodySmall" color="primary">
                {contact.email}
              </Text>
            )}
            {contact.phoneWork !== null && (
              <Text variant="bodySmall" color="secondary">
                {contact.phoneWork}
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
