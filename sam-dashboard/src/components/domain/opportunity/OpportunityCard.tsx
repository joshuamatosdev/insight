import { CSSProperties, ReactNode } from 'react';
import { Opportunity, getOpportunityType } from './Opportunity.types';
import { Text, Button, ExternalLinkIcon } from '../../primitives';
import { Card, CardHeader, CardBody, HStack, Grid } from '../../layout';
import { NAICSBadge } from '../naics';
import { TypeBadge } from './TypeBadge';

interface OpportunityCardProps {
  opportunity: Opportunity;
  className?: string;
  style?: CSSProperties;
  extraBadge?: ReactNode;
}

export function OpportunityCard({ opportunity, className, style, extraBadge }: OpportunityCardProps) {
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getDeadlineColor = (deadline: string | undefined): 'danger' | 'warning' | 'success' | 'muted' => {
    if (!deadline) return 'muted';
    const now = new Date();
    const dl = new Date(deadline);
    const daysUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (daysUntil < 0) return 'muted';
    if (daysUntil <= 3) return 'danger';
    if (daysUntil <= 7) return 'warning';
    return 'success';
  };

  const cardStyles: CSSProperties = {
    marginBottom: 'var(--spacing-4)',
    ...style,
  };

  return (
    <Card className={className} style={cardStyles}>
      <CardHeader>
        <HStack justify="between" align="start">
          <div style={{ flex: 1, minWidth: 0 }}>
            <a
              href={opportunity.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginBottom: 'var(--spacing-1)',
                textDecoration: 'none',
              }}
            >
              <Text variant="heading5">
                {opportunity.title || 'Untitled'}
              </Text>
            </a>
            <Text variant="bodySmall" color="muted">
              {opportunity.solicitationNumber || 'N/A'}
            </Text>
          </div>
          <HStack spacing="var(--spacing-2)">
            <NAICSBadge code={opportunity.naicsCode} />
            <TypeBadge type={getOpportunityType(opportunity.type)} label={opportunity.type} />
            {extraBadge}
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <Grid columns={3} gap="var(--spacing-4)">
          <div>
            <Text variant="caption" color="muted" style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}>
              Posted Date
            </Text>
            <Text variant="body" weight="semibold">
              {formatDate(opportunity.postedDate)}
            </Text>
          </div>
          <div>
            <Text variant="caption" color="muted" style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}>
              Response Deadline
            </Text>
            <Text variant="body" weight="semibold" color={getDeadlineColor(opportunity.responseDeadLine)}>
              {formatDate(opportunity.responseDeadLine)}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <a
              href={opportunity.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                size="sm"
                variant="primary"
                leftIcon={<ExternalLinkIcon size="sm" />}
              >
                View on SAM.gov
              </Button>
            </a>
          </div>
        </Grid>
      </CardBody>
    </Card>
  );
}

export default OpportunityCard;
