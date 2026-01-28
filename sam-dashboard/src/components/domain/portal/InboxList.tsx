import type {CSSProperties} from 'react';

import type {InboxListProps} from './Portal.types';
import {Badge, Text} from '../../catalyst/primitives';
import {Box, Flex, Stack} from '../../catalyst/layout';

/**
 * Inbox list showing message threads.
 */
export function InboxList({
  threads,
  selectedThreadId,
  onSelectThread,
  onArchive,
  isLoading = false,
  className,
  style,
}: InboxListProps): React.ReactElement {
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      return dateStr;
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  };

  const containerStyles: CSSProperties = {
    overflowY: 'auto',
    ...style,
  };

  if (isLoading) {
    return (
      <Box style={containerStyles}>
        <Flex justify="center" align="center">
          <Text variant="body" color="muted">
            Loading messages...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (threads.length === 0) {
    return (
      <Box style={containerStyles}>
        <Flex
          justify="center"
          align="center"
          direction="column"
        >
          <Text variant="heading5" color="muted">
            No messages
          </Text>
          <Text variant="bodySmall" color="muted">
            Your inbox is empty
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box style={containerStyles}>
      <Stack spacing="0">
        {threads.map((thread) => {
          const isSelected = selectedThreadId === thread.id;
          const hasUnread = thread.unreadCount > 0;

          return (
            <Box
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              role="button"
              tabIndex={0}
              aria-selected={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectThread(thread.id);
                }
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Stack spacing="xs">
                  {/* Participants & Date */}
                  <Flex justify="space-between" align="center">
                    <Text
                      variant="bodySmall"
                      weight={hasUnread ? 'semibold' : 'normal'}
                    >
                      {thread.participants.map((p) => p.userName).join(', ')}
                    </Text>
                    <Text variant="caption" color="muted">
                      {formatDate(thread.lastMessageAt)}
                    </Text>
                  </Flex>

                  {/* Subject */}
                  <Text
                    variant="body"
                    weight={hasUnread ? 'semibold' : 'normal'}
                  >
                    {thread.subject}
                  </Text>

                  {/* Preview */}
                  <Text
                    variant="bodySmall"
                    color="muted"
                  >
                    {truncateText(thread.lastMessagePreview, 80)}
                  </Text>
                </Stack>

                {/* Unread Badge */}
                {hasUnread && (
                  <Box>
                    <Badge color="blue">
                      {thread.unreadCount}
                    </Badge>
                  </Box>
                )}
              </Flex>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export default InboxList;
