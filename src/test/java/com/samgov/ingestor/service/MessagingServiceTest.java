package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.dto.MessageDTO;
import com.samgov.ingestor.dto.MessageThreadDTO;
import com.samgov.ingestor.dto.SendMessageRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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

    @Autowired
    private ContractRepository contractRepository;

    private Contract testContract;
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

        // Create a test contract for messaging
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("MSG-TEST-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Messaging Test Contract")
            .description("Contract for testing messaging")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("Department of Defense")
            .agencyCode("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);
    }

    @Nested
    @DisplayName("Send Message Operations")
    class SendMessageOperations {

        @Test
        @DisplayName("should send message and create new thread if no thread exists")
        void shouldSendMessageAndCreateThread() {
            // Given
            SendMessageRequest request = new SendMessageRequest(
                testContract.getId(),
                null, // no existing thread
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
            assertThat(result.subject()).isEqualTo("Project Update");
            assertThat(result.body()).isEqualTo("Here is the latest status on the deliverables...");
            assertThat(result.sentAt()).isNotNull();
            assertThat(result.isRead()).isFalse();
        }

        @Test
        @DisplayName("should send message to existing thread")
        void shouldSendMessageToExistingThread() {
            // Given - create initial message and thread
            SendMessageRequest initialRequest = new SendMessageRequest(
                testContract.getId(),
                null,
                recipient.getId(),
                "Initial Subject",
                "Initial message body"
            );
            MessageDTO initialMessage = messagingService.sendMessage(initialRequest);

            // When - reply to the thread
            SendMessageRequest replyRequest = new SendMessageRequest(
                testContract.getId(),
                initialMessage.threadId(),
                recipient.getId(),
                null, // subject inherited from thread
                "Reply to initial message"
            );
            MessageDTO reply = messagingService.sendMessage(replyRequest);

            // Then
            assertThat(reply.threadId()).isEqualTo(initialMessage.threadId());
            assertThat(reply.body()).isEqualTo("Reply to initial message");
        }

        @Test
        @DisplayName("should throw exception when sending to non-existent recipient")
        void shouldThrowExceptionForNonExistentRecipient() {
            // Given
            SendMessageRequest request = new SendMessageRequest(
                testContract.getId(),
                null,
                UUID.randomUUID(), // non-existent recipient
                "Subject",
                "Body"
            );

            // When/Then
            assertThatThrownBy(() -> messagingService.sendMessage(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Recipient not found");
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
                testContract.getId(),
                null,
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
            assertThat(reply.body()).isEqualTo("I think we need to extend the deadline.");
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
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Thread not found");
        }

        @Test
        @DisplayName("should update thread lastMessageAt when replying")
        void shouldUpdateThreadLastMessageAtWhenReplying() throws InterruptedException {
            // Given
            MessageDTO initial = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(),
                null,
                recipient.getId(),
                "Thread Subject",
                "Initial message"
            ));

            MessageThreadDTO threadBefore = messagingService.getThread(initial.threadId());
            Instant lastMessageBefore = threadBefore.lastMessageAt();

            // Wait a bit to ensure timestamp differs
            Thread.sleep(10);

            // When
            messagingService.replyToThread(initial.threadId(), "Reply message");

            // Then
            MessageThreadDTO threadAfter = messagingService.getThread(initial.threadId());
            assertThat(threadAfter.lastMessageAt()).isAfter(lastMessageBefore);
        }
    }

    @Nested
    @DisplayName("Mark as Read Operations")
    class MarkAsReadOperations {

        @Test
        @DisplayName("should mark individual message as read")
        void shouldMarkMessageAsRead() {
            // Given - send message and switch to recipient
            MessageDTO message = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(),
                null,
                recipient.getId(),
                "Unread Message",
                "Please read this."
            ));

            // Switch to recipient
            switchUser(recipient);

            // Verify it's unread initially
            MessageDTO unread = messagingService.getMessage(message.id());
            assertThat(unread.isRead()).isFalse();

            // When
            messagingService.markAsRead(message.id());

            // Then
            MessageDTO read = messagingService.getMessage(message.id());
            assertThat(read.isRead()).isTrue();
            assertThat(read.readAt()).isNotNull();
        }

        @Test
        @DisplayName("should mark all messages in thread as read")
        void shouldMarkThreadAsRead() {
            // Given - send multiple messages
            MessageDTO msg1 = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(),
                null,
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

            // Then
            List<MessageDTO> messages = messagingService.getMessagesInThread(msg1.threadId());
            assertThat(messages).hasSize(3);
            assertThat(messages).allMatch(MessageDTO::isRead);
        }

        @Test
        @DisplayName("should not affect messages already read")
        void shouldNotAffectAlreadyReadMessages() {
            // Given
            MessageDTO message = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(),
                null,
                recipient.getId(),
                "Subject",
                "Body"
            ));

            switchUser(recipient);
            messagingService.markAsRead(message.id());
            MessageDTO readOnce = messagingService.getMessage(message.id());
            Instant firstReadAt = readOnce.readAt();

            // When - mark as read again
            messagingService.markAsRead(message.id());

            // Then - readAt should not change
            MessageDTO readTwice = messagingService.getMessage(message.id());
            assertThat(readTwice.readAt()).isEqualTo(firstReadAt);
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
                testContract.getId(), null, recipient.getId(), "Message 1", "Body 1"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Message 2", "Body 2"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Message 3", "Body 3"
            ));

            // Switch to recipient
            switchUser(recipient);

            // When
            long unreadCount = messagingService.getUnreadCount();

            // Then
            assertThat(unreadCount).isEqualTo(3);
        }

        @Test
        @DisplayName("should decrement unread count when marking message as read")
        void shouldDecrementUnreadCountWhenMarking() {
            // Given
            MessageDTO msg1 = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Message 1", "Body 1"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Message 2", "Body 2"
            ));

            switchUser(recipient);
            assertThat(messagingService.getUnreadCount()).isEqualTo(2);

            // When
            messagingService.markAsRead(msg1.id());

            // Then
            assertThat(messagingService.getUnreadCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return unread count per contract")
        void shouldReturnUnreadCountPerContract() {
            // Given - create another contract
            Contract contract2 = Contract.builder()
                .tenant(testTenant)
                .contractNumber("MSG-TEST-2-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Second Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("DOD")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("300000.00"))
                .build();
            contract2 = contractRepository.save(contract2);

            // Send messages to different contracts
            messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Contract 1 Msg", "Body"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                contract2.getId(), null, recipient.getId(), "Contract 2 Msg 1", "Body"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                contract2.getId(), null, recipient.getId(), "Contract 2 Msg 2", "Body"
            ));

            switchUser(recipient);

            // When
            long contract1Unread = messagingService.getUnreadCountForContract(testContract.getId());
            long contract2Unread = messagingService.getUnreadCountForContract(contract2.getId());

            // Then
            assertThat(contract1Unread).isEqualTo(1);
            assertThat(contract2Unread).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("Thread Operations")
    class ThreadOperations {

        @Test
        @DisplayName("should return threads ordered by lastMessageAt descending")
        void shouldReturnThreadsOrderedByLastMessageAt() throws InterruptedException {
            // Given - create threads with different last message times
            MessageDTO thread1 = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Thread 1", "First thread"
            ));

            Thread.sleep(10);

            MessageDTO thread2 = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Thread 2", "Second thread"
            ));

            Thread.sleep(10);

            MessageDTO thread3 = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Thread 3", "Third thread"
            ));

            // Reply to first thread to make it most recent
            Thread.sleep(10);
            messagingService.replyToThread(thread1.threadId(), "New reply to thread 1");

            // When
            List<MessageThreadDTO> threads = messagingService.getThreads(
                testContract.getId(),
                PageRequest.of(0, 10)
            ).getContent();

            // Then - thread1 should be first due to recent reply
            assertThat(threads).hasSize(3);
            assertThat(threads.get(0).id()).isEqualTo(thread1.threadId());
            assertThat(threads.get(1).id()).isEqualTo(thread3.threadId());
            assertThat(threads.get(2).id()).isEqualTo(thread2.threadId());
        }

        @Test
        @DisplayName("should return thread with participant information")
        void shouldReturnThreadWithParticipants() {
            // Given
            MessageDTO message = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Subject", "Body"
            ));

            // When
            MessageThreadDTO thread = messagingService.getThread(message.threadId());

            // Then
            assertThat(thread).isNotNull();
            assertThat(thread.participants()).hasSize(2);
            assertThat(thread.participants())
                .extracting("id")
                .containsExactlyInAnyOrder(testUser.getId(), recipient.getId());
        }

        @Test
        @DisplayName("should return thread message count")
        void shouldReturnThreadMessageCount() {
            // Given
            MessageDTO initial = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Subject", "Message 1"
            ));
            messagingService.replyToThread(initial.threadId(), "Message 2");
            messagingService.replyToThread(initial.threadId(), "Message 3");

            // When
            MessageThreadDTO thread = messagingService.getThread(initial.threadId());

            // Then
            assertThat(thread.messageCount()).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User tenant2User;
        private User tenant2Recipient;
        private Contract tenant2Contract;

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

            // Create contract in tenant 2
            tenant2Contract = Contract.builder()
                .tenant(tenant2)
                .contractNumber("T2-MSG-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Tenant 2 Contract")
                .contractType(ContractType.FIRM_FIXED_PRICE)
                .status(ContractStatus.ACTIVE)
                .agency("GSA")
                .popStartDate(LocalDate.now())
                .popEndDate(LocalDate.now().plusYears(1))
                .totalValue(new BigDecimal("300000.00"))
                .build();
            tenant2Contract = contractRepository.save(tenant2Contract);
        }

        @Test
        @DisplayName("should isolate messages between tenants")
        void shouldIsolateMessagesBetweenTenants() {
            // Given - Create message in tenant 1
            MessageDTO tenant1Msg = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Tenant 1 Message", "Body"
            ));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(tenant2User.getId());

            // Create message in tenant 2
            MessageDTO tenant2Msg = messagingService.sendMessage(new SendMessageRequest(
                tenant2Contract.getId(), null, tenant2Recipient.getId(), "Tenant 2 Message", "Body"
            ));

            // Then - Each tenant should only see their own messages
            Page<MessageThreadDTO> tenant2Threads = messagingService.getThreads(
                tenant2Contract.getId(),
                PageRequest.of(0, 10)
            );
            assertThat(tenant2Threads.getContent())
                .extracting(MessageThreadDTO::subject)
                .contains("Tenant 2 Message")
                .doesNotContain("Tenant 1 Message");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<MessageThreadDTO> tenant1Threads = messagingService.getThreads(
                testContract.getId(),
                PageRequest.of(0, 10)
            );
            assertThat(tenant1Threads.getContent())
                .extracting(MessageThreadDTO::subject)
                .contains("Tenant 1 Message")
                .doesNotContain("Tenant 2 Message");
        }

        @Test
        @DisplayName("should not allow access to other tenant's messages by ID")
        void shouldNotAllowCrossTenantMessageAccess() {
            // Given - Create message in tenant 1
            MessageDTO tenant1Msg = messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Subject", "Body"
            ));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(tenant2User.getId());

            // When/Then - Attempting to access tenant 1's message should fail
            assertThatThrownBy(() -> messagingService.getMessage(tenant1Msg.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should isolate unread counts between tenants")
        void shouldIsolateUnreadCountsBetweenTenants() {
            // Given - Send messages in tenant 1
            messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Msg 1", "Body"
            ));
            messagingService.sendMessage(new SendMessageRequest(
                testContract.getId(), null, recipient.getId(), "Msg 2", "Body"
            ));

            // Switch to tenant 2 and send messages
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(tenant2User.getId());

            messagingService.sendMessage(new SendMessageRequest(
                tenant2Contract.getId(), null, tenant2Recipient.getId(), "T2 Msg", "Body"
            ));

            // Check unread count for tenant 2 recipient
            switchUser(tenant2Recipient);
            long tenant2Unread = messagingService.getUnreadCount();
            assertThat(tenant2Unread).isEqualTo(1);

            // Check unread count for tenant 1 recipient
            switchTenant(testTenant);
            switchUser(recipient);
            long tenant1Unread = messagingService.getUnreadCount();
            assertThat(tenant1Unread).isEqualTo(2);
        }
    }
}
