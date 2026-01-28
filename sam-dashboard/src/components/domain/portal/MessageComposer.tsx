import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { MessageComposerProps } from './Portal.types';
import { Text, Button, Input } from '../../catalyst/primitives';
import { Card, CardHeader, CardBody, CardFooter, Stack, Box, Flex } from '../../catalyst/layout';

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
        <Stack spacing="md">
          {/* Subject (only for new threads) */}
          {isNewThread && (
            <Box>
              <Text
                variant="caption"
                weight="medium"
                style={{ marginBottom: '0.25rem', display: 'block' }}
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
              style={{ marginBottom: '0.25rem', display: 'block' }}
            >
              Message
            </Text>
            <textarea
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              aria-label="Message body"
              className="w-full min-h-[150px] p-3 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-base font-inherit resize-y outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Text variant="caption" color="muted" className="mt-1">
              Press Ctrl+Enter to send
            </Text>
          </Box>
        </Stack>
      </CardBody>
      <CardFooter>
        <Flex justify="end" gap="sm">
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
