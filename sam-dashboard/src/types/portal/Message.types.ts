/**
 * Message priority
 */
export type MessagePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

/**
 * Message status
 */
export type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

/**
 * Message attachment
 */
export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

/**
 * Individual message entity
 */
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientIds: string[];
  subject: string;
  body: string;
  priority: MessagePriority;
  status: MessageStatus;
  attachments: MessageAttachment[];
  parentMessageId: string | null;
  createdAt: string;
  readAt: string | null;
}

/**
 * Message thread (conversation)
 */
export interface MessageThread {
  id: string;
  contractId: string | null;
  subject: string;
  participants: ThreadParticipant[];
  lastMessageAt: string;
  lastMessagePreview: string;
  messageCount: number;
  unreadCount: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Thread participant
 */
export interface ThreadParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  lastReadAt: string | null;
}

/**
 * Request to send a message
 */
export interface SendMessageRequest {
  threadId?: string;
  recipientIds: string[];
  subject: string;
  body: string;
  priority?: MessagePriority;
  contractId?: string;
  parentMessageId?: string;
  attachmentIds?: string[];
}

/**
 * Request to mark messages as read
 */
export interface MarkAsReadRequest {
  messageIds: string[];
}

/**
 * Filters for messages
 */
export interface MessageFilters {
  contractId?: string;
  status?: MessageStatus;
  priority?: MessagePriority;
  senderId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Inbox summary stats
 */
export interface InboxSummary {
  totalMessages: number;
  unreadMessages: number;
  urgentMessages: number;
  archivedMessages: number;
}
