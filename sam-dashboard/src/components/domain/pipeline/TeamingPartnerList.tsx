import { useMemo } from 'react';
import { Card, CardHeader, CardBody } from '../../layout/Card';
import { Stack, HStack } from '../../layout/Stack';
import { Box } from '../../layout/Box';
import { Text } from '../../primitives/Text';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import type { TeamingPartnerListProps } from './TeamingPartnerList.types';
import type { TeamingPartner } from '../../../types/pipeline';

function getStatusVariant(status: TeamingPartner['status']): 'green' | 'yellow' | 'gray' {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'PENDING':
      return 'yellow';
    case 'INACTIVE':
      return 'gray';
    default:
      return 'gray';
  }
}

export function TeamingPartnerList({
  partners,
  teamingPartnersString,
  onAdd,
  onEdit,
  onRemove,
  isLoading = false,
}: TeamingPartnerListProps) {
  // Parse teaming partners from string if no structured partners provided
  const displayPartners = useMemo(() => {
    if (partners.length > 0) {
      return partners;
    }

    if (teamingPartnersString === undefined || teamingPartnersString === null || teamingPartnersString.length === 0) {
      return [];
    }

    // Parse comma-separated string into simple partner objects
    return teamingPartnersString.split(',').map((name, index) => ({
      id: `parsed-${index}`,
      name: name.trim(),
      role: 'Partner',
      status: 'ACTIVE' as const,
    }));
  }, [partners, teamingPartnersString]);

  return (
    <Card>
      <CardHeader>
        <HStack justify="between" align="center">
          <Text variant="heading5">Teaming Partners</Text>
          {onAdd !== undefined && (
            <Button variant="secondary" size="sm" onClick={onAdd}>
              Add Partner
            </Button>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        {isLoading === true && (
          <Box style={{ padding: 'var(--spacing-4)', textAlign: 'center' }}>
            <Text variant="bodySmall" color="secondary">
              Loading partners...
            </Text>
          </Box>
        )}

        {isLoading === false && displayPartners.length === 0 && (
          <Box style={{ padding: 'var(--spacing-4)', textAlign: 'center' }}>
            <Text variant="bodySmall" color="secondary">
              No teaming partners added yet
            </Text>
          </Box>
        )}

        {isLoading === false && displayPartners.length > 0 && (
          <Stack gap="sm">
            {displayPartners.map((partner) => (
              <Box
                key={partner.id}
                style={{
                  padding: 'var(--spacing-3)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <HStack justify="between" align="center">
                  <Stack gap="xs">
                    <Text variant="bodySmall" weight="medium">
                      {partner.name}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {partner.role}
                    </Text>
                  </Stack>
                  <HStack gap="sm" align="center">
                    <Badge color={getStatusVariant(partner.status)} size="sm">
                      {partner.status}
                    </Badge>
                    {(onEdit !== undefined || onRemove !== undefined) && (
                      <HStack gap="xs">
                        {onEdit !== undefined && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(partner)}
                          >
                            Edit
                          </Button>
                        )}
                        {onRemove !== undefined && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(partner)}
                          >
                            Remove
                          </Button>
                        )}
                      </HStack>
                    )}
                  </HStack>
                </HStack>
              </Box>
            ))}
          </Stack>
        )}
      </CardBody>
    </Card>
  );
}
