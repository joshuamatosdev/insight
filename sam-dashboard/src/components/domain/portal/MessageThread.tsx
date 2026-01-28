import type {CSSProperties} from 'react';
import {useEffect, useRef, useState} from 'react';

import type {MessageBubbleProps, MessageThreadProps} from './Portal.types';
import type {Message} from '../../../types/portal';
import {Button, Input, Text} from '../../catalyst/primitives';
import {Box, Flex} from '../../catalyst/layout';

/**
 * Individual message bubble.
 */
function MessageBubble({
  message,
  isOwn,
  showSender = true,
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

  return (
    <Flex
      justify={isOwn ? 'end' : 'start'}
    >
      <Box>
        {showSender && isOwn === false && (
          <Text
            variant="caption"
            weight="semibold"
          >
            {message.senderName}
          </Text>
        )}
        <Text
          variant="body"
        >
          {message.body}
        </Text>
        <Text
          variant="caption"
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
    <Box style={containerStyles}>
      {/* Header */}
      <Box>
        <Text variant="heading5">{thread.subject}</Text>
        <Text variant="caption" color="muted">
          {thread.participants.map((p) => p.userName).join(', ')}
        </Text>
      </Box>

      {/* Messages */}
      <Box>
        {messageGroups.map((group) => (
          <Box key={group.date}>
            {/* Date Separator */}
            <Flex
              justify="center"
            >
              <Box>
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
        <Box>
          <Flex gap="sm">
            <Box>
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
