import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { MessageThreadProps, MessageBubbleProps } from './Portal.types';
import type { Message } from '../../../types/portal';
import { Text, Button, Input } from '../../primitives';
import { Flex, Stack, Box } from '../../layout';

/**
 * Individual message bubble.
 */
function MessageBubble({
  message,
  isOwn,
  showSender = true,
  className,
  style,
}: MessageBubbleProps): React.ReactElement {
  const formatTime = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const bubbleStyles: CSSProperties = {
    maxWidth: '70%',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: isOwn ? 'var(--color-primary)' : 'var(--color-gray-100)',
    color: isOwn ? 'var(--color-white)' : 'inherit',
    ...style,
  };

  return (
    <Flex
      className={`${className} mb-2`}
      justify={isOwn ? 'flex-end' : 'flex-start'}
    >
      <Box style={bubbleStyles}>
        {showSender && isOwn === false && (
          <Text
            variant="caption"
            weight="semibold"
            className="mb-1"
          >
            {message.senderName}
          </Text>
        )}
        <Text
          variant="body"
          style={{ color: isOwn ? 'var(--color-white)' : 'inherit', whiteSpace: 'pre-wrap' }}
        >
          {message.body}
        </Text>
        <Text
          variant="caption"
          style={{
            marginTop: 'var(--spacing-1)',
            opacity: 0.7,
            color: isOwn ? 'var(--color-white)' : 'var(--color-gray-500)',
            textAlign: 'right',
          }}
        >
          {formatTime(message.createdAt)}
        </Text>
      </Box>
    </Flex>
  );
}

/**
 * Message thread component showing conversation and input.
 */
export function MessageThread({
  thread,
  messages,
  currentUserId,
  onSendMessage,
  onMarkAsRead,
  className,
  style,
}: MessageThreadProps): React.ReactElement {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current !== null) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (onMarkAsRead !== undefined) {
      messages
        .filter((m) => m.status === 'UNREAD' && m.senderId !== currentUserId)
        .forEach((m) => onMarkAsRead(m.id));
    }
  }, [messages, currentUserId, onMarkAsRead]);

  const handleSend = () => {
    if (newMessage.trim() !== '' && onSendMessage !== undefined) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const groupMessagesByDate = (msgs: Message[]): Array<{ date: string; messages: Message[] }> => {
    const groups: Record<string, Message[]> = {};
    msgs.forEach((msg) => {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (groups[dateKey] === undefined) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    return Object.entries(groups).map(([dateKey, groupMsgs]) => ({
      date: dateKey,
      messages: groupMsgs,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...style,
  };

  return (
    <Box className={className} style={containerStyles}>
      {/* Header */}
      <Box
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          borderBottom: '1px solid var(--color-gray-200)',
        }}
      >
        <Text variant="heading5">{thread.subject}</Text>
        <Text variant="caption" color="muted">
          {thread.participants.map((p) => p.userName).join(', ')}
        </Text>
      </Box>

      {/* Messages */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-4)',
        }}
      >
        {messageGroups.map((group) => (
          <Box key={group.date}>
            {/* Date Separator */}
            <Flex
              justify="center"
              style={{ margin: 'var(--spacing-4) 0' }}
            >
              <Box
                style={{
                  padding: 'var(--spacing-1) var(--spacing-3)',
                  backgroundColor: 'var(--color-gray-100)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <Text variant="caption" color="muted">
                  {formatDate(group.date)}
                </Text>
              </Box>
            </Flex>

            {/* Messages for this date */}
            {group.messages.map((message, index) => {
              const isOwn = message.senderId === currentUserId;
              const prevMessage = index > 0 ? group.messages[index - 1] : null;
              const showSender =
                prevMessage === null || prevMessage.senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showSender={showSender}
                />
              );
            })}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      {onSendMessage !== undefined && (
        <Box
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            borderTop: '1px solid var(--color-gray-200)',
          }}
        >
          <Flex gap="sm">
            <Box style={{ flex: 1 }}>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                aria-label="Message input"
              />
            </Box>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={newMessage.trim() === ''}
            >
              Send
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

export default MessageThread;
