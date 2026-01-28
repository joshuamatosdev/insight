import type {CSSProperties} from 'react';
import {useState} from 'react';
import type {MessageComposerProps} from './Portal.types';
import {Button, Input, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardFooter, CardHeader, Flex, Stack} from '../../catalyst/layout';

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
    <Card style={cardStyles}>
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
            />
            <Text variant="caption" color="muted">
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
