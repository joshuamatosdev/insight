/**
 * ClearanceCard - Display a single security clearance
 */

import { Text, Button, PencilIcon, TrashIcon, ShieldLockIcon } from '../../primitives';
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
import type { ClearanceCardProps, ClearanceLevel, ClearanceType } from './Compliance.types';

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
 * Formats clearance level for display
 */
function formatClearanceLevel(level: ClearanceLevel): string {
  const levelLabels: Record<ClearanceLevel, string> = {
    CONFIDENTIAL: 'Confidential',
    SECRET: 'Secret',
    TOP_SECRET: 'Top Secret',
    TOP_SECRET_SCI: 'Top Secret/SCI',
    Q_CLEARANCE: 'Q Clearance (DOE)',
    L_CLEARANCE: 'L Clearance (DOE)',
  };
  return levelLabels[level] ?? level;
}

/**
 * Formats clearance type for display
 */
function formatClearanceType(type: ClearanceType): string {
  const typeLabels: Record<ClearanceType, string> = {
    PERSONNEL: 'Personnel Clearance',
    FACILITY: 'Facility Clearance',
    INTERIM_PERSONNEL: 'Interim Personnel',
    INTERIM_FACILITY: 'Interim Facility',
  };
  return typeLabels[type] ?? type;
}

/**
 * Gets clearance level color
 */
function getClearanceLevelColor(level: ClearanceLevel): 'primary' | 'warning' | 'danger' {
  switch (level) {
    case 'TOP_SECRET':
    case 'TOP_SECRET_SCI':
    case 'Q_CLEARANCE':
      return 'danger';
    case 'SECRET':
      return 'warning';
    default:
      return 'primary';
  }
}

/**
 * Calculates days until expiration
 */
function getDaysUntilExpiration(expirationDate: string | null): number | null {
  if (expirationDate === null) return null;
  const expDate = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

export function ClearanceCard({
  clearance,
  onEdit,
  onDelete,
}: ClearanceCardProps): React.ReactElement {
  const daysUntilExpiration = getDaysUntilExpiration(clearance.expirationDate);
  const expirationInfo = getDaysUntilExpirationText(daysUntilExpiration);
  const levelColor = getClearanceLevelColor(clearance.clearanceLevel);

  const displayName = clearance.userName ?? clearance.entityName ?? 'Unknown';

  return (
    <Card variant="outlined">
      <CardHeader>
        <HStack justify="between" align="center">
          <HStack spacing="sm" align="center">
            <ShieldLockIcon size="sm" color={levelColor} />
            <Stack spacing="0">
              <Text variant="heading6" weight="semibold">
                {displayName}
              </Text>
              <Text variant="caption" color="muted">
                {formatClearanceType(clearance.clearanceType)}
              </Text>
            </Stack>
          </HStack>
          <ComplianceStatusBadge status={clearance.status} type="clearance" />
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack spacing="md">
          <HStack spacing="sm" align="center">
            <Text variant="bodySmall" weight="medium" color={levelColor}>
              {formatClearanceLevel(clearance.clearanceLevel)}
            </Text>
            {clearance.sciAccess && (
              <Text variant="caption" color="warning">
                SCI Access
              </Text>
            )}
            {clearance.sapAccess && (
              <Text variant="caption" color="warning">
                SAP Access
              </Text>
            )}
          </HStack>

          <Grid columns="1fr 1fr" gap="md">
            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Sponsoring Agency
              </Text>
              <Text variant="bodySmall">
                {clearance.sponsoringAgency ?? '-'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Case Number
              </Text>
              <Text variant="bodySmall">
                {clearance.caseNumber ?? '-'}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Grant Date
              </Text>
              <Text variant="bodySmall">
                {formatDate(clearance.grantDate)}
              </Text>
            </GridItem>

            <GridItem>
              <Text variant="caption" color="muted" weight="medium">
                Expiration Date
              </Text>
              <Text variant="bodySmall">
                {formatDate(clearance.expirationDate)}
              </Text>
            </GridItem>

            {clearance.reinvestigationDate !== null && (
              <>
                <GridItem>
                  <Text variant="caption" color="muted" weight="medium">
                    Reinvestigation Date
                  </Text>
                  <Text variant="bodySmall">
                    {formatDate(clearance.reinvestigationDate)}
                  </Text>
                </GridItem>
              </>
            )}

            {clearance.polygraphType !== null && (
              <>
                <GridItem>
                  <Text variant="caption" color="muted" weight="medium">
                    Polygraph
                  </Text>
                  <Text variant="bodySmall">
                    {clearance.polygraphType}
                    {clearance.polygraphDate !== null && (
                      <> ({formatDate(clearance.polygraphDate)})</>
                    )}
                  </Text>
                </GridItem>
              </>
            )}
          </Grid>

          {clearance.clearanceType === 'FACILITY' && clearance.fsoName !== null && (
            <Stack spacing="xs">
              <Text variant="caption" color="muted" weight="medium">
                Facility Security Officer (FSO)
              </Text>
              <Text variant="bodySmall">{clearance.fsoName}</Text>
              {clearance.fsoEmail !== null && (
                <Text variant="caption" color="muted">
                  {clearance.fsoEmail}
                </Text>
              )}
            </Stack>
          )}

          {daysUntilExpiration !== null && (
            <Text variant="bodySmall" color={expirationInfo.color} weight="medium">
              {expirationInfo.text}
            </Text>
          )}
        </Stack>
      </CardBody>

      {(onEdit !== undefined || onDelete !== undefined) && (
        <CardFooter>
          <HStack justify="end" spacing="sm">
            {onEdit !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(clearance)}
                aria-label="Edit clearance"
              >
                <PencilIcon size="sm" />
              </Button>
            )}
            {onDelete !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(clearance.id)}
                aria-label="Delete clearance"
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

export default ClearanceCard;
