import type {CSSProperties} from 'react';

import type {FeatureRequestCardProps} from './Portal.types';
import {Badge, Button, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, Flex, HStack, Stack} from '../../catalyst/layout';
import {FeatureVoteButton} from './FeatureVoteButton';

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
  const getStatusColor = (
    status: string
  ): 'blue' | 'green' | 'amber' | 'zinc' | 'red' | 'cyan' => {
    switch (status) {
      case 'SUBMITTED':
        return 'zinc';
      case 'UNDER_REVIEW':
        return 'cyan';
      case 'APPROVED':
        return 'blue';
      case 'IN_DEVELOPMENT':
        return 'amber';
      case 'COMPLETED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'DEFERRED':
        return 'zinc';
      default:
        return 'zinc';
    }
  };

  const getPriorityColor = (
    priority: string
  ): 'red' | 'amber' | 'cyan' | 'zinc' => {
    switch (priority) {
      case 'CRITICAL':
        return 'red';
      case 'HIGH':
        return 'amber';
      case 'MEDIUM':
        return 'cyan';
      default:
        return 'zinc';
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
          <Stack spacing="sm">
            {/* Header */}
            <Flex justify="space-between" align="flex-start">
              <Stack spacing="xs">
                <Text variant="heading5">{featureRequest.title}</Text>
                <HStack spacing="sm">
                  <Badge color={getStatusColor(featureRequest.status)}>
                    {featureRequest.status.replace('_', ' ')}
                  </Badge>
                  <Badge color={getPriorityColor(featureRequest.priority)}>
                    {featureRequest.priority}
                  </Badge>
                  <Badge color="zinc">
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
            >
              {featureRequest.description}
            </Text>

            {/* Tags */}
            {featureRequest.tags.length > 0 && (
              <HStack spacing="xs">
                {featureRequest.tags.map((tag) => (
                  <Box
                    key={tag}
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
