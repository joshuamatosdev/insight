/**
 * ExpirationAlert - Shows expiring certifications and clearances
 */

import { Text, BellIcon, CalendarIcon } from '../../primitives';
import { Card, CardHeader, CardBody, Stack, HStack, Box } from '../../layout';
import type { ExpirationAlertProps, Certification, SecurityClearance } from './Compliance.types';

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
 * Formats date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Gets urgency color based on days remaining
 */
function getUrgencyColor(days: number): 'danger' | 'warning' | 'info' {
  if (days <= 7) return 'danger';
  if (days <= 30) return 'warning';
  return 'info';
}

/**
 * Gets urgency background color
 */
function getUrgencyBackground(days: number): string {
  if (days <= 7) return '#fef2f2';
  if (days <= 30) return '#fffbeb';
  return '#f0f9ff';
}

/**
 * Gets urgency border color
 */
function getUrgencyBorder(days: number): string {
  if (days <= 7) return '#ef4444';
  if (days <= 30) return '#f59e0b';
  return '#0ea5e9';
}

interface ExpirationItemProps {
  type: 'certification' | 'clearance';
  name: string;
  expirationDate: string;
  daysUntilExpiration: number;
  onClick?: () => void;
}

function ExpirationItem({
  type,
  name,
  expirationDate,
  daysUntilExpiration,
  onClick,
}: ExpirationItemProps): React.ReactElement {
  const color = getUrgencyColor(daysUntilExpiration);
  const backgroundColor = getUrgencyBackground(daysUntilExpiration);
  const borderColor = getUrgencyBorder(daysUntilExpiration);

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick !== undefined) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Box
      onClick={onClick !== undefined ? handleClick : undefined}
      onKeyDown={onClick !== undefined ? handleKeyDown : undefined}
      role={onClick !== undefined ? 'button' : undefined}
      tabIndex={onClick !== undefined ? 0 : undefined}
      style={{
        padding: '0.75rem',
        backgroundColor,
        borderRadius: '0.375rem',
        border: `1px solid ${borderColor}`,
        cursor: onClick !== undefined ? 'pointer' : 'default',
        transition: 'opacity 0.2s ease',
      }}
    >
      <HStack justify="between" align="center">
        <Stack spacing="0">
          <Text variant="bodySmall" weight="medium">
            {name}
          </Text>
          <Text variant="caption" color="muted">
            {type === 'certification' ? 'Certification' : 'Clearance'}
          </Text>
        </Stack>

        <Stack spacing="0" style={{ textAlign: 'right' }}>
          <HStack spacing="xs" align="center">
            <CalendarIcon size="xs" color={color} />
            <Text variant="caption" color={color} weight="medium">
              {formatDate(expirationDate)}
            </Text>
          </HStack>
          <Text variant="caption" color={color} weight="semibold">
            {daysUntilExpiration === 0 && 'Expires today'}
            {daysUntilExpiration === 1 && '1 day remaining'}
            {daysUntilExpiration > 1 && `${daysUntilExpiration} days remaining`}
          </Text>
        </Stack>
      </HStack>
    </Box>
  );
}

export function ExpirationAlert({
  expiringCertifications,
  expiringClearances,
  daysThreshold = 90,
  onViewCertification,
  onViewClearance,
}: ExpirationAlertProps): React.ReactElement | null {
  // Combine and sort all expiring items
  const allItems: Array<{
    type: 'certification' | 'clearance';
    name: string;
    expirationDate: string;
    daysUntilExpiration: number;
    item: Certification | SecurityClearance;
  }> = [];

  expiringCertifications.forEach((cert) => {
    const days = cert.daysUntilExpiration ?? getDaysUntilExpiration(cert.expirationDate);
    if (days !== null && days <= daysThreshold && days >= 0) {
      allItems.push({
        type: 'certification',
        name: cert.name,
        expirationDate: cert.expirationDate as string,
        daysUntilExpiration: days,
        item: cert,
      });
    }
  });

  expiringClearances.forEach((clearance) => {
    const days = getDaysUntilExpiration(clearance.expirationDate);
    if (days !== null && days <= daysThreshold && days >= 0) {
      const displayName = clearance.userName ?? clearance.entityName ?? 'Clearance';
      allItems.push({
        type: 'clearance',
        name: displayName,
        expirationDate: clearance.expirationDate as string,
        daysUntilExpiration: days,
        item: clearance,
      });
    }
  });

  // Sort by days remaining (most urgent first)
  allItems.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);

  if (allItems.length === 0) {
    return null;
  }

  const urgentCount = allItems.filter((item) => item.daysUntilExpiration <= 30).length;

  return (
    <Card
      variant="outlined"
      style={{
        borderColor: urgentCount > 0 ? '#f59e0b' : '#0ea5e9',
      }}
    >
      <CardHeader>
        <HStack spacing="sm" align="center">
          <BellIcon
            size="sm"
            color={urgentCount > 0 ? 'warning' : 'info'}
          />
          <Text variant="heading6" weight="semibold">
            Expiring Soon ({allItems.length})
          </Text>
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack spacing="sm">
          {allItems.slice(0, 5).map((item, index) => (
            <ExpirationItem
              key={`${item.type}-${index}`}
              type={item.type}
              name={item.name}
              expirationDate={item.expirationDate}
              daysUntilExpiration={item.daysUntilExpiration}
              onClick={
                item.type === 'certification' && onViewCertification !== undefined
                  ? () => onViewCertification(item.item as Certification)
                  : item.type === 'clearance' && onViewClearance !== undefined
                  ? () => onViewClearance(item.item as SecurityClearance)
                  : undefined
              }
            />
          ))}

          {allItems.length > 5 && (
            <Text
              variant="caption"
              color="muted"
              className="text-center mt-2"
            >
              +{allItems.length - 5} more items expiring soon
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default ExpirationAlert;
