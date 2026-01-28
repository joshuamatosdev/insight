import {useState} from 'react';
import {Badge, Button, Input, Text} from '../../components/catalyst/primitives';
import {Box, Card, CardBody, Flex, Grid, Stack} from '../../components/catalyst/layout';
import {InboxList, MessageComposer, MessageThread} from '../../components/domain/portal';
import {useMessaging} from '../../hooks';
import {useAuth} from '../../auth';

/**
 * Messaging page with inbox and conversation view.
 */
export function MessagingPage(): React.ReactElement {
  const [showComposer, setShowComposer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();
  const currentUserId = user?.id ?? '';

  const {
    threads,
    messages,
    summary,
    selectedThread,
    isLoading,
    error,
    refresh,
    selectThread,
    sendMessage,
    markAsRead,
    archiveMessage,
  } = useMessaging();

  const handleSelectThread = async (threadId: string) => {
    try {
      await selectThread(threadId);
      setShowComposer(false);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  };

  const handleSendMessage = async (body: string) => {
    if (selectedThread === null) {
      return;
    }
    try {
      await sendMessage({
        threadId: selectedThread.id,
        recipientIds: selectedThread.participants
          .filter((p) => p.userId !== currentUserId)
          .map((p) => p.userId),
        subject: selectedThread.subject,
        body,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendNewMessage = async (body: string) => {
    try {
      await sendMessage({
        recipientIds: [], // Would need to be populated from composer
        subject: 'New Message',
        body,
      });
      setShowComposer(false);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsRead([messageId]);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Filter threads by search
  const filteredThreads = threads.filter((thread) => {
    if (searchQuery === '') {
      return true;
    }
    const query = searchQuery.toLowerCase();
    return (
      thread.subject.toLowerCase().includes(query) ||
      thread.lastMessagePreview.toLowerCase().includes(query) ||
      thread.participants.some((p) => p.userName.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center">
        <Text variant="body" color="muted">
          Loading messages...
        </Text>
      </Flex>
    );
  }

  if (error !== null) {
    return (
      <Box>
        <Text variant="body" color="danger">
          Error loading messages: {error.message}
        </Text>
        <Button variant="secondary" onClick={refresh}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing="lg">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Stack spacing="0">
          <Text variant="heading2">Messages</Text>
          <Text variant="body" color="muted">
            Communicate with your team and stakeholders
          </Text>
        </Stack>
        <Button
          variant="primary"
          onClick={() => {
            setShowComposer(true);
            selectThread(null);
          }}
        >
          New Message
        </Button>
      </Flex>

      {/* Summary Stats */}
      {summary !== null && (
        <Grid columns={4} gap="md">
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Total Messages
                </Text>
                <Text variant="heading3">{summary.totalMessages}</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Unread
                </Text>
                <Flex align="center" gap="sm">
                  <Text variant="heading3">{summary.unreadMessages}</Text>
                  {summary.unreadMessages > 0 && (
                    <Badge color="blue">
                      New
                    </Badge>
                  )}
                </Flex>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Urgent
                </Text>
                <Flex align="center" gap="sm">
                  <Text variant="heading3">{summary.urgentMessages}</Text>
                  {summary.urgentMessages > 0 && (
                    <Badge color="red">
                      !
                    </Badge>
                  )}
                </Flex>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Archived
                </Text>
                <Text variant="heading3">{summary.archivedMessages}</Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      )}

      {/* Main Content */}
      <Card>
        <Grid columns={3}>
          {/* Inbox Sidebar */}
          <Box>
            {/* Search */}
            <Box>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                aria-label="Search messages"
              />
            </Box>

            {/* Thread List */}
            <InboxList
              threads={filteredThreads}
              selectedThreadId={selectedThread?.id}
              onSelectThread={handleSelectThread}
            />
          </Box>

          {/* Message Content (2 columns) */}
          <Box>
            {showComposer ? (
              <Box>
                <MessageComposer
                  onSend={handleSendNewMessage}
                  onCancel={() => setShowComposer(false)}
                />
              </Box>
            ) : selectedThread !== null ? (
              <MessageThread
                thread={selectedThread}
                messages={messages}
                currentUserId={currentUserId}
                onSendMessage={handleSendMessage}
                onMarkAsRead={handleMarkAsRead}
              />
            ) : (
              <Flex
                justify="center"
                align="center"
                direction="column"
              >
                <Text variant="heading4" color="muted">
                  Select a Conversation
                </Text>
                <Text variant="body" color="muted">
                  Choose a thread from the inbox or start a new message
                </Text>
              </Flex>
            )}
          </Box>
        </Grid>
      </Card>
    </Stack>
  );
}

export default MessagingPage;
