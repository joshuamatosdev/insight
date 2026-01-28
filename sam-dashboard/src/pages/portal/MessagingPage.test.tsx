import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MessagingPage} from './MessagingPage';
import * as hooks from '../../hooks/usePortal';
import type {Message, MessageThread, ThreadParticipant} from '../../types/portal';

// Mock the hooks
vi.mock('../../hooks/usePortal', () => ({
    useMessaging: vi.fn(),
}));

const mockParticipant1: ThreadParticipant = {
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    lastReadAt: null,
};

const mockParticipant2: ThreadParticipant = {
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    lastReadAt: null,
};

const mockParticipant3: ThreadParticipant = {
    userId: 'user-3',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    lastReadAt: null,
};

const mockMessages: Message[] = [
    {
        id: 'msg-1',
        threadId: 'thread-1',
        senderId: 'user-1',
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        recipientIds: ['user-2'],
        subject: 'Project Timeline Discussion',
        body: 'Can we discuss the project timeline?',
        priority: 'NORMAL',
        status: 'READ',
        attachments: [],
        parentMessageId: null,
        createdAt: '2025-01-20T10:00:00Z',
        readAt: '2025-01-20T10:05:00Z',
    },
    {
        id: 'msg-2',
        threadId: 'thread-1',
        senderId: 'user-2',
        senderName: 'Jane Smith',
        senderEmail: 'jane@example.com',
        recipientIds: ['user-1'],
        subject: 'RE: Project Timeline Discussion',
        body: 'Sure, I have some updates to share.',
        priority: 'NORMAL',
        status: 'READ',
        attachments: [],
        parentMessageId: 'msg-1',
        createdAt: '2025-01-20T10:15:00Z',
        readAt: '2025-01-20T10:20:00Z',
    },
];

const mockThreads: MessageThread[] = [
    {
        id: 'thread-1',
        contractId: null,
        subject: 'Project Timeline Discussion',
        participants: [mockParticipant1, mockParticipant2],
        lastMessageAt: '2025-01-20T10:15:00Z',
        lastMessagePreview: 'Sure, I have some updates to share.',
        messageCount: 2,
        unreadCount: 0,
        messages: mockMessages,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:15:00Z',
    },
    {
        id: 'thread-2',
        contractId: null,
        subject: 'Budget Approval Request',
        participants: [mockParticipant1, mockParticipant3],
        lastMessageAt: '2025-01-19T15:30:00Z',
        lastMessagePreview: 'Please review the attached budget.',
        messageCount: 3,
        unreadCount: 2,
        messages: [],
        createdAt: '2025-01-19T15:00:00Z',
        updatedAt: '2025-01-19T15:30:00Z',
    },
];

const mockInboxSummary = {
    totalMessages: 5,
    unreadMessages: 2,
    urgentMessages: 0,
    archivedMessages: 0,
};

function renderMessagingPage() {
    return render(<MessagingPage/>);
}

describe('MessagingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        (hooks.useMessaging as Mock).mockReturnValue({
            threads: mockThreads,
            inboxSummary: mockInboxSummary,
            selectedThread: null,
            isLoading: false,
            error: null,
            selectThread: vi.fn(),
            sendMessage: vi.fn(),
            markAsRead: vi.fn(),
            archiveThread: vi.fn(),
            refresh: vi.fn(),
        });
    });

    describe('Rendering', () => {
        it('should render the Messaging section', () => {
            renderMessagingPage();
            expect(screen.getByText(/messaging/i)).toBeInTheDocument();
        });

        it('should render section header with title', () => {
            renderMessagingPage();
            expect(screen.getByText(/messaging/i)).toBeInTheDocument();
        });

        it('should render New Message button', () => {
            renderMessagingPage();
            expect(screen.getByRole('button', {name: /new message/i})).toBeInTheDocument();
        });
    });

    describe('Inbox Summary', () => {
        it('should display unread count', () => {
            renderMessagingPage();
            expect(screen.getByText('2')).toBeInTheDocument(); // unread messages
        });

        it('should display total threads count', () => {
            renderMessagingPage();
            expect(screen.getByText(/2 conversations/i)).toBeInTheDocument();
        });
    });

    describe('Thread List', () => {
        it('should display thread subjects', () => {
            renderMessagingPage();
            expect(screen.getByText('Project Timeline Discussion')).toBeInTheDocument();
            expect(screen.getByText('Budget Approval Request')).toBeInTheDocument();
        });

        it('should display participant names', () => {
            renderMessagingPage();
            expect(screen.getByText(/john doe/i)).toBeInTheDocument();
            expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
        });

        it('should display last message preview', () => {
            renderMessagingPage();
            expect(screen.getByText(/sure, i have some updates to share/i)).toBeInTheDocument();
            expect(screen.getByText(/please review the attached budget/i)).toBeInTheDocument();
        });

        it('should display unread indicator for unread threads', () => {
            renderMessagingPage();
            // Thread 2 has unreadCount: 2
            const unreadBadges = screen.getAllByText('2');
            expect(unreadBadges.length).toBeGreaterThan(0);
        });
    });

    describe('Loading State', () => {
        it('should display loading message when threads are loading', () => {
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: [],
                inboxSummary: null,
                selectedThread: null,
                isLoading: true,
                error: null,
                selectThread: vi.fn(),
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            renderMessagingPage();
            expect(screen.getByText(/loading messages/i)).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should display error message when loading fails', () => {
            const errorMessage = 'Failed to load messages';
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: [],
                inboxSummary: null,
                selectedThread: null,
                isLoading: false,
                error: new Error(errorMessage),
                selectThread: vi.fn(),
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            renderMessagingPage();
            expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should display empty state when no threads exist', () => {
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: [],
                inboxSummary: {totalMessages: 0, unreadMessages: 0, urgentMessages: 0, archivedMessages: 0},
                selectedThread: null,
                isLoading: false,
                error: null,
                selectThread: vi.fn(),
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            renderMessagingPage();
            expect(screen.getByText(/no messages/i)).toBeInTheDocument();
        });
    });

    describe('Thread Selection', () => {
        it('should call selectThread when a thread is clicked', async () => {
            const selectThreadMock = vi.fn();
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: mockThreads,
                inboxSummary: mockInboxSummary,
                selectedThread: null,
                isLoading: false,
                error: null,
                selectThread: selectThreadMock,
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            const user = userEvent.setup();
            renderMessagingPage();

            const threadItem = screen.getByText('Project Timeline Discussion');
            await user.click(threadItem);

            expect(selectThreadMock).toHaveBeenCalledWith('thread-1');
        });
    });

    describe('Message Composition', () => {
        it('should display message input when a thread is selected', () => {
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: mockThreads,
                inboxSummary: mockInboxSummary,
                selectedThread: mockThreads[0],
                isLoading: false,
                error: null,
                selectThread: vi.fn(),
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            renderMessagingPage();
            expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
        });

        it('should display Send button when a thread is selected', () => {
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: mockThreads,
                inboxSummary: mockInboxSummary,
                selectedThread: mockThreads[0],
                isLoading: false,
                error: null,
                selectThread: vi.fn(),
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            renderMessagingPage();
            expect(screen.getByRole('button', {name: /send/i})).toBeInTheDocument();
        });

        it('should call sendMessage when Send button is clicked', async () => {
            const sendMessageMock = vi.fn();
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: mockThreads,
                inboxSummary: mockInboxSummary,
                selectedThread: mockThreads[0],
                isLoading: false,
                error: null,
                selectThread: vi.fn(),
                sendMessage: sendMessageMock,
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            const user = userEvent.setup();
            renderMessagingPage();

            const messageInput = screen.getByPlaceholderText(/type a message/i);
            await user.type(messageInput, 'This is a test message');

            const sendButton = screen.getByRole('button', {name: /send/i});
            await user.click(sendButton);

            expect(sendMessageMock).toHaveBeenCalledWith('thread-1', 'This is a test message');
        });
    });

    describe('Message Thread View', () => {
        it('should display messages in the selected thread', () => {
            (hooks.useMessaging as Mock).mockReturnValue({
                threads: mockThreads,
                inboxSummary: mockInboxSummary,
                selectedThread: mockThreads[0],
                isLoading: false,
                error: null,
                selectThread: vi.fn(),
                sendMessage: vi.fn(),
                markAsRead: vi.fn(),
                archiveThread: vi.fn(),
                refresh: vi.fn(),
            });

            renderMessagingPage();
            expect(screen.getByText('Can we discuss the project timeline?')).toBeInTheDocument();
            expect(screen.getByText('Sure, I have some updates to share.')).toBeInTheDocument();
        });
    });
});
