import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MessageComposerProps } from './Portal.types';
import { Text, Button, Input } from '../../primitives';
import { Card, CardHeader, CardBody, CardFooter, Stack, Box, Flex } from '../../layout';

/**
 * Component for composing and sending new messages.
 */
export function MessageComposer({
  recipientIds,
  threadId,
  placeholder = 'Write your message...',
  onSend,
  onCancel,
  isLoading = false,
  className,
  style,
}: MessageComposerProps): React.ReactElement {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (body.trim() !== '') {
      onSend(body.trim());
      setBody('');
      setSubject('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isNewThread = threadId === undefined;
  const canSend = body.trim() !== '' && (isNewThread === false || subject.trim() !== '');

  const cardStyles: CSSProperties = {
    ...style,
  };

  return (
    <Card className={className} style={cardStyles}>
      <CardHeader>
        <Text variant="heading5">
          {isNewThread ? 'New Message' : 'Reply'}
        </Text>
      </CardHeader>
      <CardBody>
        <Stack spacing="var(--spacing-3)">
          {/* Subject (only for new threads) */}
          {isNewThread && (
            <Box>
              <Text
                variant="caption"
                weight="medium"
                style={{ marginBottom: 'var(--spacing-1)', display: 'block' }}
              >
                Subject
              </Text>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject..."
                disabled={isLoading}
                aria-label="Message subject"
              />
            </Box>
          )}

          {/* Message Body */}
          <Box>
            <Text
              variant="caption"
              weight="medium"
              style={{ marginBottom: 'var(--spacing-1)', display: 'block' }}
            >
              Message
            </Text>
            <Box
              as="textarea"
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              aria-label="Message body"
              style={{
                width: '100%',
                minHeight: '150px',
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-gray-300)',
                fontSize: 'var(--font-size-body)',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <Text variant="caption" color="muted" style={{ marginTop: 'var(--spacing-1)' }}>
              Press Ctrl+Enter to send
            </Text>
          </Box>
        </Stack>
      </CardBody>
      <CardFooter>
        <Flex justify="flex-end" gap="sm">
          {onCancel !== undefined && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={canSend === false || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
}

export default MessageComposer;
