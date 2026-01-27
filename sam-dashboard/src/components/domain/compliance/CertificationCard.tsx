/**
 * CertificationCard - Display a single certification
 */

import { Text, Button, PencilIcon, TrashIcon, FileCheckIcon } from '../../primitives';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Stack,
  HStack,
  Grid,
  GridItem,
} from '../../layout';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import type { CertificationCardProps } from './Compliance.types';

/**
 * Formats date for display
 */
function formatDate(dateString: string | null): string {
  if (dateString === null) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats certification type for display
 */
function formatCertificationType(type: string): string {
  const typeLabels: Record<string, string> = {
    SAM_REGISTRATION: 'SAM Registration',
    EIGHT_A: '8(a) Business Development',
    HUBZONE: 'HUBZone',
    WOSB: 'Women-Owned Small Business',
    EDWOSB: 'Economically Disadvantaged WOSB',
    SDVOSB: 'Service-Disabled Veteran-Owned',
    VOSB: 'Veteran-Owned Small Business',
    SBA_MENTOR_PROTEGE: 'SBA Mentor-Protege',
    DBE: 'Disadvantaged Business Enterprise',
    MBE: 'Minority Business Enterprise',
    WBE: 'Women Business Enterprise',
    SBE: 'Small Business Enterprise',
    STATE_CERTIFICATION: 'State Certification',
    ISO_9001: 'ISO 9001',
    ISO_27001: 'ISO 27001',
    ISO_20000: 'ISO 20000',
    CMMI: 'CMMI',
    SOC2: 'SOC 2',
    FEDRAMP: 'FedRAMP',
    FACILITY_CLEARANCE: 'Facility Clearance',
    CMMC: 'CMMC',
    OTHER: 'Other',
  };
  return typeLabels[type] ?? type;
}

/**
 * Gets days until expiration text with appropriate styling
 */
function getDaysUntilExpirationText(days: number | null): {
  text: string;
  color: 'success' | 'warning' | 'danger' | 'muted';
} {
  if (days === null) {
    return { text: 'No expiration', color: 'muted' };
  }
  if (days < 0) {
    return { text: `Expired ${Math.abs(days)} days ago`, color: 'danger' };
  }
  if (days === 0) {
    return { text: 'Expires today', color: 'danger' };
  }
  if (days <= 30) {
    return { text: `${days} days remaining`, color: 'danger' };
  }
  if (days <= 90) {
    return { text: `${days} days remaining`, color: 'warning' };
  }
  return { text: `${days} days remaining`, color: 'success' };
}

export function CertificationCard({
  certification,
  onEdit,
  onDelete,
  onViewDetails,
}: CertificationCardProps): React.ReactElement {
  const expirationInfo = getDaysUntilExpirationText(certification.daysUntilExpiration);

  const handleClick = () => {
    if (onViewDetails !== undefined) {
      onViewDetails(certification);
    }
  };

  return (
    <Card
      variant="outlined"
      onClick={onViewDetails !== undefined ? handleClick : undefined}
      style={onViewDetails !== undefined ? { cursor: 'pointer' } : undefined}
    >
      <CardHeader>
        <HStack justify="between" align="center">
          <HStack spacing="var(--spacing-2)" align="center">
            <FileCheckIcon size="sm" color="primary" />
            <Stack spacing="0">
              <Text variant="heading6" weight="semibold">
                {certification.name}
              </Text>
              <Text variant="caption" color="muted">
                {formatCertificationType(certification.certificationType)}
              </Text>
            </Stack>
          </HStack>
          <ComplianceStatusBadge status={certification.status} type="certification" />
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack spacing="var(--spacing-3)">
          {certification.description !== null && certification.description.length > 0 && (
            <Text variant="bodySmall" color="muted">
              {certification.description}
            </Text>
          )}

          <Grid columns="1fr 1fr" gap="var(--spacing-3)">
            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Certificate Number
              </Text>
              <Text variant="bodySmall">
                {certification.certificateNumber ?? '-'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Issuing Agency
              </Text>
              <Text variant="bodySmall">
                {certification.issuingAgency ?? '-'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Issue Date
              </Text>
              <Text variant="bodySmall">
                {formatDate(certification.issueDate)}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Expiration Date
              </Text>
              <Text variant="bodySmall">
                {formatDate(certification.expirationDate)}
              </Text>
            </GridItem>
          </Grid>

          {certification.daysUntilExpiration !== null && (
            <Text variant="bodySmall" color={expirationInfo.color} weight="medium">
              {expirationInfo.text}
            </Text>
          )}
        </Stack>
      </CardBody>

      {(onEdit !== undefined || onDelete !== undefined) && (
        <CardFooter>
          <HStack justify="end" spacing="var(--spacing-2)">
            {onEdit !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(certification);
                }}
                aria-label="Edit certification"
              >
                <PencilIcon size="sm" />
              </Button>
            )}
            {onDelete !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(certification.id);
                }}
                aria-label="Delete certification"
              >
                <TrashIcon size="sm" color="danger" />
              </Button>
            )}
          </HStack>
        </CardFooter>
      )}
    </Card>
  );
}

export default CertificationCard;
