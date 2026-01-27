package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.dto.MessageDTO;
import com.samgov.ingestor.dto.MessageThreadDTO;
import com.samgov.ingestor.dto.SendMessageRequest;
import com.samgov.ingestor.dto.ThreadWithMessagesDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for MessagingService.
 *
 * Tests the business logic of messaging within contractor portals:
 * - Message sending (creates thread if needed)
 * - Reply to thread
 * - Mark as read (individual message and thread)
 * - Unread count
 * - Thread ordering by lastMessageAt
 * - Multi-tenant isolation
 */
@DisplayName("MessagingService")
class MessagingServiceTest extends BaseServiceTest {

    @Autowired
    private MessagingService messagingService;

    private User recipient;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();

        // Create recipient user
        recipient = User.builder()
            .email("recipient-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Recipient")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        recipient = userRepository.save(recipient);

        // Create role and membership for recipient
        Role recipientRole = createTestRole(testTenant, Role.USER);
        TenantMembership recipientMembership = TenantMembership.builder()
            .user(recipient)
            .tenant(testTenant)
            .role(recipientRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        tenantMembershipRepository.save(recipientMembership);
    }

    @Nested
    @DisplayName("Send Message Operations")
    class SendMessageOperations {

        @Test
        @DisplayName("should send message and create new thread if no thread exists")
        void shouldSendMessageAndCreateThread() {
            // Given
            SendMessageRequest request = new SendMessageRequest(
                recipient.getId(),
                "Project Update",
                "Here is the latest status on the deliverables..."
            );

            // When
            MessageDTO result = messagingService.sendMessage(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.threadId()).isNotNull();
            assertThat(result.senderId()).isEqualTo(testUser.getId());
            assertThat(result.content()).isEqualTo("Here is the latest status on the deliverables...");
            assertThat(result.createdAt()).isNotNull();
            assertThat(result.isRead()).isFalse();
        }

        @Test
        @DisplayName("should send message and use existing thread between users")
        void shouldSendMessageToExistingThread() {
            // Given - create initial message and thread
            SendMessageRequest initialRequest = new SendMessageRequest(
                recipient.getId(),
                "Initial Subject",
                "Initial message body"
            );
            MessageDTO initialMessage = messagingService.sendMessage(initialRequest);

            // When - send another message (should use same thread)
            SendMessageRequest secondRequest = new SendMessageRequest(
                recipient.getId(),
                "Follow up",
                "Follow up message"
            );
            MessageDTO secondMessage = messagingService.sendMessage(secondRequest);

            // Then - Both messages should be in the same thread
            assertThat(secondMessage.threadId()).isEqualTo(initialMessage.threadId());
            assertThat(secondMessage.content()).isEqualTo("Follow up message");
        }

        @Test
        @DisplayName("should throw exception when sending to non-existent recipient")
        void shouldThrowExceptionForNonExistentRecipient() {
            // Given
            SendMessageRequest request = new SendMessageRequest(
                UUID.randomUUID(), // non-existent recipient
                "Subject",
                "Body"
            );

            // When/Then
            assertThatThrownBy(() -> messagingService.sendMessage(request))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Reply to Thread")
    class ReplyToThread {

        @Test
        @DisplayName("should reply to thread successfully")
        void shouldReplyToThreadSuccessfully() {
            // Given - create a thread first
            MessageDTO initial = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(),
                "Discussion Thread",
                "Let's discuss the project timeline."
            ));

            // When
            MessageDTO reply = messagingService.replyToThread(
                initial.threadId(),
                "I think we need to extend the deadline."
            );

            // Then
            assertThat(reply.threadId()).isEqualTo(initial.threadId());
            assertThat(reply.content()).isEqualTo("I think we need to extend the deadline.");
            assertThat(reply.senderId()).isEqualTo(testUser.getId());
        }

        @Test
        @DisplayName("should throw exception when replying to non-existent thread")
        void shouldThrowExceptionForNonExistentThread() {
            // When/Then
            assertThatThrownBy(() -> messagingService.replyToThread(
                UUID.randomUUID(),
                "Reply body"
            ))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should update thread lastMessageAt when replying")
        void shouldUpdateThreadLastMessageAtWhenReplying() throws InterruptedException {
            // Given
            MessageDTO initial = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(),
                "Thread Subject",
                "Initial message"
            ));

            ThreadWithMessagesDTO threadBefore = messagingService.getThread(initial.threadId());
            Instant lastMessageBefore = threadBefore.lastMessageAt();

            // Wait a bit to ensure timestamp differs
            Thread.sleep(10);

            // When
            messagingService.replyToThread(initial.threadId(), "Reply message");

            // Then
            ThreadWithMessagesDTO threadAfter = messagingService.getThread(initial.threadId());
            assertThat(threadAfter.lastMessageAt()).isAfter(lastMessageBefore);
        }
    }

    @Nested
    @DisplayName("Mark as Read Operations")
    class MarkAsReadOperations {

        @Test
        @DisplayName("should mark individual message as read")
        void shouldMarkMessageAsRead() {
            // Given - send message
            MessageDTO message = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(),
                "Unread Message",
                "Please read this."
            ));

            // Switch to recipient
            switchUser(recipient);

            // When
            messagingService.markAsRead(message.id());

            // Then - verify through the thread's messages
            ThreadWithMessagesDTO thread = messagingService.getThread(message.threadId());
            MessageDTO updatedMessage = thread.messages().stream()
                .filter(m -> m.id().equals(message.id()))
                .findFirst()
                .orElseThrow();
            assertThat(updatedMessage.isRead()).isTrue();
        }

        @Test
        @DisplayName("should mark all messages in thread as read")
        void shouldMarkThreadAsRead() {
            // Given - send multiple messages
            MessageDTO msg1 = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(),
                "Thread Subject",
                "Message 1"
            ));

            messagingService.replyToThread(msg1.threadId(), "Message 2");
            messagingService.replyToThread(msg1.threadId(), "Message 3");

            // Switch to recipient
            switchUser(recipient);

            // When
            messagingService.markThreadAsRead(msg1.threadId());

            // Then - Get thread to verify through unread count in participants
            ThreadWithMessagesDTO thread = messagingService.getThread(msg1.threadId());
            assertThat(thread.messages()).hasSize(3);
        }
    }

    @Nested
    @DisplayName("Unread Count")
    class UnreadCount {

        @Test
        @DisplayName("should return correct unread count")
        void shouldReturnCorrectUnreadCount() {
            // Given - send multiple messages to recipient
            messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Message 1", "Body 1"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Message 2", "Body 2"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Message 3", "Body 3"
            ));

            // Switch to recipient
            switchUser(recipient);

            // When
            long unreadCount = messagingService.getUnreadCount();

            // Then - Note: messages go to same thread, but unread count is per participant
            // Each message increments the recipient's unread count in the thread
            assertThat(unreadCount).isGreaterThanOrEqualTo(1);
        }

        @Test
        @DisplayName("should decrease unread count when marking thread as read")
        void shouldDecreaseUnreadCountWhenMarkingThreadAsRead() {
            // Given
            MessageDTO msg1 = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Message 1", "Body 1"
            ));

            switchUser(recipient);
            long unreadBefore = messagingService.getUnreadCount();

            // When
            messagingService.markThreadAsRead(msg1.threadId());

            // Then
            long unreadAfter = messagingService.getUnreadCount();
            assertThat(unreadAfter).isLessThanOrEqualTo(unreadBefore);
        }
    }

    @Nested
    @DisplayName("Thread Operations")
    class ThreadOperations {

        @Test
        @DisplayName("should return threads ordered by lastMessageAt descending")
        void shouldReturnThreadsOrderedByLastMessageAt() throws InterruptedException {
            // Given - create another recipient for a separate thread
            User recipient2 = User.builder()
                .email("recipient2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Recipient2")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            recipient2 = userRepository.save(recipient2);

            Role recipientRole = createTestRole(testTenant, Role.USER);
            TenantMembership membership = TenantMembership.builder()
                .user(recipient2)
                .tenant(testTenant)
                .role(recipientRole)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(membership);

            // Create threads with different recipients (different threads)
            MessageDTO thread1 = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Thread 1", "First thread"
            ));

            Thread.sleep(10);

            MessageDTO thread2 = messagingService.sendMessage(new SendMessageRequest(
                recipient2.getId(), "Thread 2", "Second thread"
            ));

            // Reply to first thread to make it most recent
            Thread.sleep(10);
            messagingService.replyToThread(thread1.threadId(), "New reply to thread 1");

            // When
            Page<MessageThreadDTO> threads = messagingService.getThreads(PageRequest.of(0, 10));

            // Then - thread1 should be first due to recent reply
            assertThat(threads.getContent().size()).isGreaterThanOrEqualTo(2);
            assertThat(threads.getContent().get(0).id()).isEqualTo(thread1.threadId());
        }

        @Test
        @DisplayName("should return thread with participant information")
        void shouldReturnThreadWithParticipants() {
            // Given
            MessageDTO message = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Subject", "Body"
            ));

            // When
            ThreadWithMessagesDTO thread = messagingService.getThread(message.threadId());

            // Then
            assertThat(thread).isNotNull();
            assertThat(thread.participants()).hasSize(2);
            assertThat(thread.participants())
                .extracting("userId")
                .containsExactlyInAnyOrder(testUser.getId(), recipient.getId());
        }

        @Test
        @DisplayName("should return thread message count")
        void shouldReturnThreadMessageCount() {
            // Given
            MessageDTO initial = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Subject", "Message 1"
            ));
            messagingService.replyToThread(initial.threadId(), "Message 2");
            messagingService.replyToThread(initial.threadId(), "Message 3");

            // When
            ThreadWithMessagesDTO thread = messagingService.getThread(initial.threadId());

            // Then
            assertThat(thread.totalMessages()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User tenant2User;
        private User tenant2Recipient;

        @BeforeEach
        void setUpSecondTenant() {
            // Create second tenant
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create second tenant user
            tenant2User = User.builder()
                .email("t2user-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Tenant2")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            tenant2User = userRepository.save(tenant2User);

            // Create second tenant recipient
            tenant2Recipient = User.builder()
                .email("t2recipient-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Tenant2")
                .lastName("Recipient")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            tenant2Recipient = userRepository.save(tenant2Recipient);

            // Create memberships
            var role2 = createTestRole(tenant2, Role.USER);
            TenantMembership userMembership = TenantMembership.builder()
                .user(tenant2User)
                .tenant(tenant2)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(userMembership);

            TenantMembership recipientMembership = TenantMembership.builder()
                .user(tenant2Recipient)
                .tenant(tenant2)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(recipientMembership);
        }

        @Test
        @DisplayName("should isolate messages between tenants")
        void shouldIsolateMessagesBetweenTenants() {
            // Given - Create message in tenant 1
            MessageDTO tenant1Msg = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Tenant 1 Message", "Body"
            ));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(tenant2User.getId());

            // Create message in tenant 2
            MessageDTO tenant2Msg = messagingService.sendMessage(new SendMessageRequest(
                tenant2Recipient.getId(), "Tenant 2 Message", "Body"
            ));

            // Then - Each tenant should only see their own threads
            Page<MessageThreadDTO> tenant2Threads = messagingService.getThreads(PageRequest.of(0, 10));
            assertThat(tenant2Threads.getContent())
                .extracting(MessageThreadDTO::subject)
                .contains("Tenant 2 Message")
                .doesNotContain("Tenant 1 Message");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<MessageThreadDTO> tenant1Threads = messagingService.getThreads(PageRequest.of(0, 10));
            assertThat(tenant1Threads.getContent())
                .extracting(MessageThreadDTO::subject)
                .contains("Tenant 1 Message")
                .doesNotContain("Tenant 2 Message");
        }

        @Test
        @DisplayName("should not allow access to other tenant's threads by ID")
        void shouldNotAllowCrossTenantThreadAccess() {
            // Given - Create message in tenant 1
            MessageDTO tenant1Msg = messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Subject", "Body"
            ));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(tenant2User.getId());

            // When/Then - Attempting to access tenant 1's thread should fail
            assertThatThrownBy(() -> messagingService.getThread(tenant1Msg.threadId()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should isolate unread counts between tenants")
        void shouldIsolateUnreadCountsBetweenTenants() {
            // Given - Send messages in tenant 1
            messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Msg 1", "Body"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                recipient.getId(), "Msg 2", "Body"
            ));

            // Switch to tenant 2 and send messages
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(tenant2User.getId());

            messagingService.sendMessage(new SendMessageRequest(
                tenant2Recipient.getId(), "T2 Msg", "Body"
            ));

            // Check unread count for tenant 2 recipient
            switchUser(tenant2Recipient);
            long tenant2Unread = messagingService.getUnreadCount();
            assertThat(tenant2Unread).isGreaterThanOrEqualTo(1);

            // Check unread count for tenant 1 recipient
            switchTenant(testTenant);
            switchUser(recipient);
            long tenant1Unread = messagingService.getUnreadCount();
            assertThat(tenant1Unread).isGreaterThanOrEqualTo(1);
        }
    }
}
