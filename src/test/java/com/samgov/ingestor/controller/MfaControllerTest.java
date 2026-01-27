package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.MfaVerifyRequest;
import com.samgov.ingestor.model.MfaBackupCode;
import com.samgov.ingestor.model.MfaSettings;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.MfaBackupCodeRepository;
import com.samgov.ingestor.repository.MfaSettingsRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for MfaController.
 * Tests MFA endpoints for setup, verification, backup codes, and disable functionality.
 */
@DisplayName("MfaController")
class MfaControllerTest extends BaseControllerTest {

    private static final String MFA_BASE_URL = "/api/v1/mfa";
    private static final String STATUS_URL = MFA_BASE_URL + "/status";
    private static final String SETUP_URL = MFA_BASE_URL + "/setup";
    private static final String VERIFY_SETUP_URL = MFA_BASE_URL + "/verify-setup";
    private static final String VERIFY_URL = MFA_BASE_URL + "/verify";
    private static final String BACKUP_CODES_URL = MFA_BASE_URL + "/backup-codes";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    @Autowired
    private MfaSettingsRepository mfaSettingsRepository;

    @Autowired
    private MfaBackupCodeRepository backupCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Tenant testTenant;
    private User testUser;
    private Role testUserRole;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();

        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant")
            .slug("test-tenant-" + UUID.randomUUID().toString().substring(0, 8))
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create test role
        testUserRole = Role.builder()
            .tenant(testTenant)
            .name(Role.USER)
            .description("Test user role")
            .isSystemRole(false)
            .build();
        testUserRole = roleRepository.save(testUserRole);

        // Create test user
        testUser = User.builder()
            .email("mfa-test-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Test")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .mfaEnabled(false)
            .build();
        testUser = userRepository.save(testUser);

        // Create membership
        TenantMembership membership = TenantMembership.builder()
            .user(testUser)
            .tenant(testTenant)
            .role(testUserRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Set tenant context for tests
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

    @Nested
    @DisplayName("GET /api/v1/mfa/status")
    class GetMfaStatus {

        @Test
        @WithMockUser
        @DisplayName("should return MFA status for authenticated user")
        void should_ReturnMfaStatus_When_Authenticated() throws Exception {
            // Arrange - set up MFA for user
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .lastVerifiedAt(Instant.now())
                .build();
            mfaSettingsRepository.save(settings);

            // Create some backup codes
            for (int i = 0; i < 8; i++) {
                MfaBackupCode code = MfaBackupCode.builder()
                    .user(testUser)
                    .codeHash(passwordEncoder.encode("CODE" + i))
                    .used(false)
                    .build();
                backupCodeRepository.save(code);
            }

            // Act & Assert
            mockMvc.perform(get(STATUS_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.remainingBackupCodes").value(8));
        }

        @Test
        @WithMockUser
        @DisplayName("should return disabled status when MFA not configured")
        void should_ReturnDisabledStatus_When_MfaNotConfigured() throws Exception {
            // Act & Assert
            mockMvc.perform(get(STATUS_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.remainingBackupCodes").value(0));
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/setup")
    class StartSetup {

        @Test
        @WithMockUser
        @DisplayName("should return secret and QR code when setup initiated")
        void should_ReturnSecretAndQrCode_When_SetupInitiated() throws Exception {
            // Act & Assert
            mockMvc.perform(post(SETUP_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").isNotEmpty())
                .andExpect(jsonPath("$.qrCodeUrl").value(startsWith("data:image/png;base64,")))
                .andExpect(jsonPath("$.provisioningUri").value(startsWith("otpauth://totp/")))
                .andExpect(jsonPath("$.setupComplete").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when MFA already enabled")
        void should_Return400_When_MfaAlreadyEnabled() throws Exception {
            // Arrange - set up MFA for user
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            // Act & Assert
            mockMvc.perform(post(SETUP_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/verify-setup")
    class VerifySetup {

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is missing")
        void should_Return400_When_CodeMissing() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder().build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_SETUP_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is invalid")
        void should_Return400_When_CodeInvalid() throws Exception {
            // Arrange - setup MFA first
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("000000")
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_SETUP_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when MFA setup not initiated")
        void should_Return400_When_SetupNotInitiated() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("123456")
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_SETUP_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/verify")
    class VerifyCode {

        @Test
        @WithMockUser
        @DisplayName("should return valid=false when TOTP code is invalid")
        void should_ReturnValidFalse_When_TotpCodeInvalid() throws Exception {
            // Arrange - set up MFA for user
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("000000")
                .isBackupCode(false)
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should return valid=true when backup code is valid")
        void should_ReturnValidTrue_When_BackupCodeValid() throws Exception {
            // Arrange - set up MFA and backup codes for user
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            String plainCode = "ABCD1234";
            MfaBackupCode backupCode = MfaBackupCode.builder()
                .user(testUser)
                .codeHash(passwordEncoder.encode(plainCode))
                .used(false)
                .build();
            backupCodeRepository.save(backupCode);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("ABCD-1234") // With dash for formatting
                .isBackupCode(true)
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true));
        }

        @Test
        @WithMockUser
        @DisplayName("should return valid=false when backup code is already used")
        void should_ReturnValidFalse_When_BackupCodeAlreadyUsed() throws Exception {
            // Arrange - set up MFA and used backup code
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            String plainCode = "USED1234";
            MfaBackupCode backupCode = MfaBackupCode.builder()
                .user(testUser)
                .codeHash(passwordEncoder.encode(plainCode))
                .used(true)
                .usedAt(Instant.now())
                .build();
            backupCodeRepository.save(backupCode);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("USED-1234")
                .isBackupCode(true)
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should return valid=false when backup code is invalid")
        void should_ReturnValidFalse_When_BackupCodeInvalid() throws Exception {
            // Arrange - set up MFA without matching backup code
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("INVALID1")
                .isBackupCode(true)
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false));
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is missing")
        void should_Return400_When_CodeMissing() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .isBackupCode(false)
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when MFA not enabled")
        void should_Return400_When_MfaNotEnabled() throws Exception {
            // Arrange - MFA not set up
            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("123456")
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/mfa/backup-codes")
    class GenerateBackupCodes {

        @Test
        @WithMockUser
        @DisplayName("should return 400 when MFA code is invalid")
        void should_Return400_When_MfaCodeInvalid() throws Exception {
            // Arrange - set up MFA
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("000000")
                .build();

            // Act & Assert
            mockMvc.perform(post(BACKUP_CODES_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is missing")
        void should_Return400_When_CodeMissing() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder().build();

            // Act & Assert
            mockMvc.perform(post(BACKUP_CODES_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/mfa")
    class DisableMfa {

        @Test
        @WithMockUser
        @DisplayName("should return 400 when MFA code is invalid")
        void should_Return400_When_MfaCodeInvalid() throws Exception {
            // Arrange - set up MFA
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();
            mfaSettingsRepository.save(settings);

            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("000000")
                .build();

            // Act & Assert
            mockMvc.perform(delete(MFA_BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when MFA not enabled")
        void should_Return400_When_MfaNotEnabled() throws Exception {
            // Arrange - MFA not set up
            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("123456")
                .build();

            // Act & Assert
            mockMvc.perform(delete(MFA_BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is missing")
        void should_Return400_When_CodeMissing() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder().build();

            // Act & Assert
            mockMvc.perform(delete(MFA_BASE_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is too short")
        void should_Return400_When_CodeTooShort() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("12345") // 5 characters, less than minimum 6
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser
        @DisplayName("should return 400 when code is too long")
        void should_Return400_When_CodeTooLong() throws Exception {
            // Arrange
            MfaVerifyRequest request = MfaVerifyRequest.builder()
                .code("123456789") // 9 characters, more than maximum 8
                .build();

            // Act & Assert
            mockMvc.perform(post(VERIFY_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isBadRequest());
        }
    }
}
