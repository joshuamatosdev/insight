import {CSSProperties} from 'react';
import {getOpportunityType, OpportunityCardProps} from './Opportunity.types';
import {Button, ExternalLinkIcon, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardHeader, Grid, HStack, Stack} from '../../catalyst/layout';
import {NAICSBadge} from '../naics';
import {TypeBadge} from './TypeBadge';

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
    marginBottom: '1rem',
    ...style,
  };

  return (
    <Card style={cardStyles}>
      <CardHeader>
        <HStack justify="between" align="start">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <a
              href={opportunity.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginBottom: '0.25rem',
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
          </Box>
          <HStack spacing="sm">
            <NAICSBadge code={opportunity.naicsCode} />
            <TypeBadge type={getOpportunityType(opportunity.type)} label={opportunity.type} />
            {extraBadge}
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <Grid columns={3} gap="md">
          <Stack spacing="xs">
            <Text variant="caption" color="muted">
              Posted Date
            </Text>
            <Text variant="body" weight="semibold">
              {formatDate(opportunity.postedDate)}
            </Text>
          </Stack>
          <Stack spacing="xs">
            <Text variant="caption" color="muted">
              Response Deadline
            </Text>
            <Text variant="body" weight="semibold" color={getDeadlineColor(opportunity.responseDeadLine)}>
              {formatDate(opportunity.responseDeadLine)}
            </Text>
          </Stack>
          <Box style={{ textAlign: 'right' }}>
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
          </Box>
        </Grid>
      </CardBody>
    </Card>
  );
}

export default OpportunityCard;
