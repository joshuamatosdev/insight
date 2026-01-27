import type { CSSProperties } from 'react';
import type { FeatureRequestCardProps } from './Portal.types';
import { Text, Badge, Button } from '../../catalyst/primitives';
import { Card, CardBody, Flex, Stack, Box, HStack } from '../../catalyst/layout';
import { FeatureVoteButton } from './FeatureVoteButton';

/**
 * Card displaying a feature request with voting functionality.
 */
export function FeatureRequestCard({
  featureRequest,
  onVote,
  onUnvote,
  onClick,
  onEdit,
  className,
  style,
}: FeatureRequestCardProps): React.ReactElement {
  const getStatusVariant = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'secondary' | 'danger' | 'info' => {
    switch (status) {
      case 'SUBMITTED':
        return 'secondary';
      case 'UNDER_REVIEW':
        return 'info';
      case 'APPROVED':
        return 'primary';
      case 'IN_DEVELOPMENT':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'DEFERRED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (
    priority: string
  ): 'danger' | 'warning' | 'info' | 'secondary' => {
    switch (priority) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'ENHANCEMENT':
        return 'Enhancement';
      case 'NEW_FEATURE':
        return 'New Feature';
      case 'BUG_FIX':
        return 'Bug Fix';
      case 'PERFORMANCE':
        return 'Performance';
      case 'USABILITY':
        return 'Usability';
      case 'INTEGRATION':
        return 'Integration';
      default:
        return category;
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(featureRequest);
    }
  };

  const handleVote = () => {
    if (onVote !== undefined) {
      onVote(featureRequest.id);
    }
  };

  const handleUnvote = () => {
    if (onUnvote !== undefined) {
      onUnvote(featureRequest.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(featureRequest);
    }
  };

  const cardStyles: CSSProperties = {
    cursor: onClick !== undefined ? 'pointer' : 'default',
    ...style,
  };

  return (
    <Card
      className={className}
      style={cardStyles}
      onClick={handleClick}
      aria-label={`Feature request: ${featureRequest.title}`}
    >
      <CardBody>
        <Flex gap="md">
          {/* Vote Button */}
          <FeatureVoteButton
            voteCount={featureRequest.voteCount}
            hasVoted={featureRequest.hasVoted}
            onVote={handleVote}
            onUnvote={handleUnvote}
          />

          {/* Content */}
          <Stack spacing="sm" style={{ flex: 1 }}>
            {/* Header */}
            <Flex justify="space-between" align="flex-start">
              <Stack spacing="xs">
                <Text variant="heading5">{featureRequest.title}</Text>
                <HStack spacing="sm">
                  <Badge variant={getStatusVariant(featureRequest.status)} size="sm">
                    {featureRequest.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityVariant(featureRequest.priority)} size="sm">
                    {featureRequest.priority}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {getCategoryLabel(featureRequest.category)}
                  </Badge>
                </HStack>
              </Stack>
              {onEdit !== undefined && (
                <Button size="sm" variant="ghost" onClick={handleEdit}>
                  Edit
                </Button>
              )}
            </Flex>

            {/* Description */}
            <Text
              variant="body"
              color="muted"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {featureRequest.description}
            </Text>

            {/* Tags */}
            {featureRequest.tags.length > 0 && (
              <HStack spacing="xs">
                {featureRequest.tags.map((tag) => (
                  <Box
                    key={tag}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#f4f4f5',
                      borderRadius: '9999px',
                    }}
                  >
                    <Text variant="caption" color="muted">
                      #{tag}
                    </Text>
                  </Box>
                ))}
              </HStack>
            )}

            {/* Footer */}
            <Flex justify="space-between" align="center">
              <HStack spacing="md">
                <Text variant="caption" color="muted">
                  by {featureRequest.submitterName}
                </Text>
                <Text variant="caption" color="muted">
                  {formatDate(featureRequest.createdAt)}
                </Text>
              </HStack>
              {featureRequest.comments.length > 0 && (
                <Text variant="caption" color="muted">
                  {featureRequest.comments.length} comment
                  {featureRequest.comments.length !== 1 ? 's' : ''}
                </Text>
              )}
            </Flex>

            {/* Assignee & Target Release */}
            {(featureRequest.assigneeName !== null || featureRequest.targetRelease !== null) && (
              <HStack spacing="md">
                {featureRequest.assigneeName !== null && (
                  <Text variant="caption">
                    Assigned to: {featureRequest.assigneeName}
                  </Text>
                )}
                {featureRequest.targetRelease !== null && (
                  <Text variant="caption">
                    Target: {featureRequest.targetRelease}
                  </Text>
                )}
              </HStack>
            )}
          </Stack>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default FeatureRequestCard;
