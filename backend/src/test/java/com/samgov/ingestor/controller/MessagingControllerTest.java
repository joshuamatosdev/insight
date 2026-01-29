package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.SendMessageRequest;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Behavioral tests for MessagingController REST API.
 *
 * Tests focus on HTTP behavior:
 * - Send message endpoints
 * - Reply to thread
 * - Mark as read endpoints
 * - Unread count
 * - Thread listing
 */
@DisplayName("MessagingController")
class MessagingControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/portal/messages";
    private static final String THREADS_URL = "/threads";
    private static final String CONTRACTS_URL = "/contracts";

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    private Tenant testTenant;
    private User testUser;
    private User recipient;
    private Role testRole;
    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .permissions("MESSAGE_CREATE,MESSAGE_READ,MESSAGE_UPDATE")
            .isSystemRole(false)
            .build();
        testRole = roleRepository.save(testRole);

        // Create test user (sender)
        testUser = User.builder()
            .email("sender-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Sender")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testUser = userRepository.save(testUser);

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

        // Create memberships
        TenantMembership senderMembership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(senderMembership);

        TenantMembership recipientMembership = TenantMembership.builder()
            .user(recipient)
            .tenant(testTenant)
            .role(testRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(recipientMembership);

        // Create test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("CTRL-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Test Contract")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testUser.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testUser.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private SendMessageRequest createMessageRequest(String subject, String body) {
        return new SendMessageRequest(
            recipient.getId(),
            subject,
            body
        );
    }

    @Nested
    @DisplayName("POST /messages")
    @WithMockUser(roles = "USER")
    class SendMessage {

        @Test
        @DisplayName("should send message and return 201 CREATED")
        void shouldSendMessageSuccessfully() throws Exception {
            // Given
            SendMessageRequest request = createMessageRequest("Project Update", "Here is the latest status...");

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.threadId", notNullValue()))
                .andExpect(jsonPath("$.senderId", is(testUser.getId().toString())))
                .andExpect(jsonPath("$.content", is("Here is the latest status...")))
                .andExpect(jsonPath("$.isRead", is(false)));
        }

        @Test
        @DisplayName("should return 400 BAD REQUEST for missing body")
        void shouldReturn400ForMissingBody() throws Exception {
            // Given
            SendMessageRequest request = new SendMessageRequest(
                recipient.getId(),
                "Subject",
                null // missing body
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 404 NOT FOUND for non-existent recipient")
        void shouldReturn404ForNonExistentRecipient() throws Exception {
            // Given
            SendMessageRequest request = new SendMessageRequest(
                UUID.randomUUID(), // non-existent recipient
                "Subject",
                "Body"
            );

            // When/Then
            performPost(BASE_URL, request)
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /threads/{threadId}/messages")
    @WithMockUser(roles = "USER")
    class ReplyToThread {

        @Test
        @DisplayName("should reply to thread successfully")
        void shouldReplyToThreadSuccessfully() throws Exception {
            // Given - create initial message
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Initial message"))
                .andExpect(status().isCreated())
                .andReturn();

            String threadId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("threadId").asText();

            // When/Then
            mockMvc.perform(post(THREADS_URL + "/" + threadId + "/messages")
                    .param("body", "This is a reply")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.threadId", is(threadId)))
                .andExpect(jsonPath("$.content", is("This is a reply")));
        }

        @Test
        @DisplayName("should return 404 for non-existent thread")
        void shouldReturn404ForNonExistentThread() throws Exception {
            // When/Then
            mockMvc.perform(post(THREADS_URL + "/" + UUID.randomUUID() + "/messages")
                    .param("body", "Reply")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /messages/{id}")
    @WithMockUser(roles = "USER")
    class GetMessage {

        @Test
        @DisplayName("should return message by ID")
        void shouldReturnMessageById() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Body"))
                .andExpect(status().isCreated())
                .andReturn();

            String messageId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // When/Then
            performGet(BASE_URL + "/" + messageId)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(messageId)));
        }

        @Test
        @DisplayName("should return 404 for non-existent message")
        void shouldReturn404ForNonExistent() throws Exception {
            // When/Then
            performGet(BASE_URL + "/" + UUID.randomUUID())
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Mark as Read Endpoints")
    @WithMockUser(roles = "USER")
    class MarkAsReadEndpoints {

        @Test
        @DisplayName("PATCH /messages/{id}/read - should mark message as read")
        void shouldMarkMessageAsRead() throws Exception {
            // Given - send message
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Body"))
                .andExpect(status().isCreated())
                .andReturn();

            String messageId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Switch to recipient
            testUserId = recipient.getId();
            TenantContext.setCurrentUserId(recipient.getId());

            // When/Then
            mockMvc.perform(patch(BASE_URL + "/" + messageId + "/read")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", recipient.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead", is(true)))
                .andExpect(jsonPath("$.readAt", notNullValue()));
        }

        @Test
        @DisplayName("PATCH /threads/{threadId}/read - should mark all messages in thread as read")
        void shouldMarkThreadAsRead() throws Exception {
            // Given - send multiple messages
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Message 1"))
                .andExpect(status().isCreated())
                .andReturn();

            String threadId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("threadId").asText();

            // Reply to thread
            mockMvc.perform(post(THREADS_URL + "/" + threadId + "/messages")
                    .param("body", "Message 2")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated());

            // Switch to recipient
            testUserId = recipient.getId();
            TenantContext.setCurrentUserId(recipient.getId());

            // When/Then
            mockMvc.perform(patch(THREADS_URL + "/" + threadId + "/read")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", recipient.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

            // Verify all messages are read
            mockMvc.perform(get(THREADS_URL + "/" + threadId + "/messages")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", recipient.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].isRead").value(org.hamcrest.Matchers.everyItem(is(true))));
        }
    }

    @Nested
    @DisplayName("Unread Count Endpoints")
    @WithMockUser(roles = "USER")
    class UnreadCountEndpoints {

        @Test
        @DisplayName("GET /messages/unread/count - should return total unread count")
        void shouldReturnTotalUnreadCount() throws Exception {
            // Given - send messages to recipient
            performPost(BASE_URL, createMessageRequest("Msg 1", "Body 1"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createMessageRequest("Msg 2", "Body 2"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createMessageRequest("Msg 3", "Body 3"))
                .andExpect(status().isCreated());

            // Switch to recipient
            testUserId = recipient.getId();
            TenantContext.setCurrentUserId(recipient.getId());

            // When/Then
            mockMvc.perform(get(BASE_URL + "/unread/count")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", recipient.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(3)));
        }

        @Test
        @DisplayName("GET /contracts/{id}/messages/unread/count - should return unread count for contract")
        void shouldReturnUnreadCountForContract() throws Exception {
            // Given - send messages
            performPost(BASE_URL, createMessageRequest("Msg 1", "Body 1"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createMessageRequest("Msg 2", "Body 2"))
                .andExpect(status().isCreated());

            // Switch to recipient
            testUserId = recipient.getId();
            TenantContext.setCurrentUserId(recipient.getId());

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/messages/unread/count")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", recipient.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(2)));
        }
    }

    @Nested
    @DisplayName("Thread Listing Endpoints")
    @WithMockUser(roles = "USER")
    class ThreadListingEndpoints {

        @Test
        @DisplayName("GET /contracts/{id}/threads - should return threads for contract")
        void shouldReturnThreadsForContract() throws Exception {
            // Given - create threads
            performPost(BASE_URL, createMessageRequest("Thread 1", "Body 1"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createMessageRequest("Thread 2", "Body 2"))
                .andExpect(status().isCreated());
            performPost(BASE_URL, createMessageRequest("Thread 3", "Body 3"))
                .andExpect(status().isCreated());

            // When/Then
            mockMvc.perform(get(CONTRACTS_URL + "/" + testContract.getId() + "/threads")
                    .param("page", "0")
                    .param("size", "10")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)));
        }

        @Test
        @DisplayName("GET /threads/{id} - should return thread details")
        void shouldReturnThreadDetails() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Thread Subject", "Body"))
                .andExpect(status().isCreated())
                .andReturn();

            String threadId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("threadId").asText();

            // When/Then
            mockMvc.perform(get(THREADS_URL + "/" + threadId)
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(threadId)))
                .andExpect(jsonPath("$.subject", is("Thread Subject")))
                .andExpect(jsonPath("$.participants", hasSize(2)))
                .andExpect(jsonPath("$.messageCount", greaterThanOrEqualTo(1)));
        }

        @Test
        @DisplayName("GET /threads/{id}/messages - should return messages in thread")
        void shouldReturnMessagesInThread() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Message 1"))
                .andExpect(status().isCreated())
                .andReturn();

            String threadId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("threadId").asText();

            // Add replies
            mockMvc.perform(post(THREADS_URL + "/" + threadId + "/messages")
                    .param("body", "Message 2")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON));

            // When/Then
            mockMvc.perform(get(THREADS_URL + "/" + threadId + "/messages")
                    .header("X-Tenant-Id", testTenantId.toString())
                    .header("X-User-Id", testUserId.toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    @WithMockUser(roles = "USER")
    class TenantIsolation {

        @Test
        @DisplayName("should return 404 when accessing other tenant's message")
        void shouldReturn404ForOtherTenantMessage() throws Exception {
            // Given - create message
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Body"))
                .andExpect(status().isCreated())
                .andReturn();

            String messageId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asText();

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            User user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("User")
                .lastName("Two")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Switch tenant
            testTenantId = tenant2.getId();
            testUserId = user2.getId();
            TenantContext.setCurrentTenantId(tenant2.getId());
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then
            performGet(BASE_URL + "/" + messageId)
                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 when accessing other tenant's thread")
        void shouldReturn404ForOtherTenantThread() throws Exception {
            // Given
            MvcResult createResult = performPost(BASE_URL, createMessageRequest("Subject", "Body"))
                .andExpect(status().isCreated())
                .andReturn();

            String threadId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("threadId").asText();

            // Create second tenant
            Tenant tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            User user2 = User.builder()
                .email("user2t-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash")
                .firstName("User")
                .lastName("Two")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Switch tenant
            testTenantId = tenant2.getId();
            testUserId = user2.getId();
            TenantContext.setCurrentTenantId(tenant2.getId());
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then
            mockMvc.perform(get(THREADS_URL + "/" + threadId)
                    .header("X-Tenant-Id", tenant2.getId().toString())
                    .header("X-User-Id", user2.getId().toString())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        }
    }
}
