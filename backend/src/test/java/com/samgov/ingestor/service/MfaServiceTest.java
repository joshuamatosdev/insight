package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.MfaSetupResponse;
import com.samgov.ingestor.model.MfaBackupCode;
import com.samgov.ingestor.model.MfaSettings;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.MfaBackupCodeRepository;
import com.samgov.ingestor.repository.MfaSettingsRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.MfaService.MfaStatus;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.time.SystemTimeProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for MfaService.
 * Tests MFA setup, verification, backup codes, and enable/disable functionality.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MfaService")
class MfaServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MfaSettingsRepository mfaSettingsRepository;

    @Mock
    private MfaBackupCodeRepository backupCodeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MfaService mfaService;

    @Captor
    private ArgumentCaptor<MfaSettings> mfaSettingsCaptor;

    @Captor
    private ArgumentCaptor<MfaBackupCode> backupCodeCaptor;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.builder()
            .id(testUserId)
            .email("test@example.com")
            .firstName("Test")
            .lastName("User")
            .status(User.UserStatus.ACTIVE)
            .mfaEnabled(false)
            .build();

        // Set appName for QR code generation
        ReflectionTestUtils.setField(mfaService, "appName", "SAM.gov Contract Intelligence");
    }

    @Nested
    @DisplayName("generateMfaSecret")
    class GenerateMfaSecret {

        @Test
        @DisplayName("should generate secret and QR code for user without existing MFA settings")
        void should_GenerateSecretAndQrCode_When_NoExistingSettings() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
            when(mfaSettingsRepository.save(any(MfaSettings.class))).thenAnswer(i -> i.getArgument(0));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            MfaSetupResponse response = mfaService.generateMfaSecret(testUserId);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getSecret()).isNotBlank();
            assertThat(response.getQrCodeUrl()).startsWith("data:image/png;base64,");
            assertThat(response.getProvisioningUri()).startsWith("otpauth://totp/");
            assertThat(response.isSetupComplete()).isFalse();

            verify(mfaSettingsRepository).save(mfaSettingsCaptor.capture());
            MfaSettings savedSettings = mfaSettingsCaptor.getValue();
            assertThat(savedSettings.getSecret()).isEqualTo(response.getSecret());
            assertThat(savedSettings.isEnabled()).isFalse();
        }

        @Test
        @DisplayName("should update existing MFA settings with new secret")
        void should_UpdateExistingSettings_When_SettingsExistButNotEnabled() {
            // Arrange
            MfaSettings existingSettings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret("old-secret")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingSettings));
            when(mfaSettingsRepository.save(any(MfaSettings.class))).thenAnswer(i -> i.getArgument(0));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            MfaSetupResponse response = mfaService.generateMfaSecret(testUserId);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getSecret()).isNotBlank();
            assertThat(response.getSecret()).isNotEqualTo("old-secret");
        }

        @Test
        @DisplayName("should throw exception when user not found")
        void should_ThrowException_When_UserNotFound() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.generateMfaSecret(testUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
        }

        @Test
        @DisplayName("should throw exception when MFA is already enabled")
        void should_ThrowException_When_MfaAlreadyEnabled() {
            // Arrange
            MfaSettings enabledSettings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("existing-secret")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(enabledSettings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.generateMfaSecret(testUserId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA is already enabled for this user");
        }
    }

    @Nested
    @DisplayName("verifyAndEnableMfa")
    class VerifyAndEnableMfa {

        @Test
        @DisplayName("should throw exception when code is invalid during enable")
        void should_ThrowException_When_CodeInvalidDuringEnable() {
            // Arrange
            String secret = "JBSWY3DPEHPK3PXP"; // Valid test secret
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret(secret)
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Since we can't easily mock the internal CodeVerifier, we test the error path
            // The internal codeVerifier uses real TOTP validation, so an invalid code will fail
            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyAndEnableMfa(testUserId, "invalid"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid verification code");
        }

        @Test
        @DisplayName("should throw exception when user not found")
        void should_ThrowException_When_UserNotFound() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyAndEnableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
        }

        @Test
        @DisplayName("should throw exception when MFA settings not found")
        void should_ThrowException_When_SettingsNotFound() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyAndEnableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA secret not generated. Please start setup first.");
        }

        @Test
        @DisplayName("should throw exception when MFA is already enabled")
        void should_ThrowException_When_MfaAlreadyEnabled() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("secret")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyAndEnableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA is already enabled for this user");
        }

        @Test
        @DisplayName("should throw exception when secret is null")
        void should_ThrowException_When_SecretNull() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret(null)
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyAndEnableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA secret not generated. Please start setup first.");
        }

        @Test
        @DisplayName("should throw exception when verification code is invalid")
        void should_ThrowException_When_CodeInvalid() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret("JBSWY3DPEHPK3PXP")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyAndEnableMfa(testUserId, "000000"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid verification code");
        }
    }

    @Nested
    @DisplayName("verifyCode")
    class VerifyCode {

        @Test
        @DisplayName("should throw exception when user not found")
        void should_ThrowException_When_UserNotFound() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyCode(testUserId, "123456", false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
        }

        @Test
        @DisplayName("should throw exception when MFA not configured")
        void should_ThrowException_When_MfaNotConfigured() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyCode(testUserId, "123456", false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA is not configured for this user");
        }

        @Test
        @DisplayName("should throw exception when MFA not enabled")
        void should_ThrowException_When_MfaNotEnabled() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret("secret")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.verifyCode(testUserId, "123456", false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA is not enabled for this user");
        }

        @Test
        @DisplayName("should return false when TOTP code is invalid")
        void should_ReturnFalse_When_TotpCodeInvalid() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act
            boolean result = mfaService.verifyCode(testUserId, "000000", false);

            // Assert
            assertThat(result).isFalse();
            verify(mfaSettingsRepository, never()).save(any());
        }

        @Test
        @DisplayName("should delegate to verifyBackupCode when isBackupCode is true")
        void should_DelegateToVerifyBackupCode_When_IsBackupCodeTrue() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));
            when(backupCodeRepository.findByUserIdAndUsedFalse(testUserId)).thenReturn(new ArrayList<>());

            // Act
            boolean result = mfaService.verifyCode(testUserId, "ABCD-1234", true);

            // Assert
            assertThat(result).isFalse();
            verify(backupCodeRepository).findByUserIdAndUsedFalse(testUserId);
        }
    }

    @Nested
    @DisplayName("verifyBackupCode")
    class VerifyBackupCode {

        @Test
        @DisplayName("should return true and mark code as used when backup code is valid")
        void should_ReturnTrueAndMarkCodeUsed_When_BackupCodeValid() {
            // Arrange
            String plainCode = "ABCD1234";
            String hashedCode = "$2a$10$hashedcode";

            MfaBackupCode backupCode = MfaBackupCode.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .codeHash(hashedCode)
                .used(false)
                .build();

            when(backupCodeRepository.findByUserIdAndUsedFalse(testUserId))
                .thenReturn(List.of(backupCode));
            when(passwordEncoder.matches(eq(plainCode), eq(hashedCode))).thenReturn(true);
            when(backupCodeRepository.save(any(MfaBackupCode.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            boolean result = mfaService.verifyBackupCode(testUserId, "ABCD-1234");

            // Assert
            assertThat(result).isTrue();
            verify(backupCodeRepository).save(backupCodeCaptor.capture());
            MfaBackupCode savedCode = backupCodeCaptor.getValue();
            assertThat(savedCode.isUsed()).isTrue();
            assertThat(savedCode.getUsedAt()).isNotNull();
        }

        @Test
        @DisplayName("should return false when no matching backup code found")
        void should_ReturnFalse_When_NoMatchingBackupCode() {
            // Arrange
            String hashedCode = "$2a$10$hashedcode";
            MfaBackupCode backupCode = MfaBackupCode.builder()
                .user(testUser)
                .codeHash(hashedCode)
                .used(false)
                .build();

            when(backupCodeRepository.findByUserIdAndUsedFalse(testUserId))
                .thenReturn(List.of(backupCode));
            when(passwordEncoder.matches(anyString(), eq(hashedCode))).thenReturn(false);

            // Act
            boolean result = mfaService.verifyBackupCode(testUserId, "WRONG-CODE");

            // Assert
            assertThat(result).isFalse();
            verify(backupCodeRepository, never()).save(any());
        }

        @Test
        @DisplayName("should return false when no unused backup codes exist")
        void should_ReturnFalse_When_NoUnusedBackupCodes() {
            // Arrange
            when(backupCodeRepository.findByUserIdAndUsedFalse(testUserId))
                .thenReturn(new ArrayList<>());

            // Act
            boolean result = mfaService.verifyBackupCode(testUserId, "ABCD-1234");

            // Assert
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should normalize backup code by removing dashes and converting to uppercase")
        void should_NormalizeBackupCode() {
            // Arrange
            String hashedCode = "$2a$10$hashedcode";
            MfaBackupCode backupCode = MfaBackupCode.builder()
                .user(testUser)
                .codeHash(hashedCode)
                .used(false)
                .build();

            when(backupCodeRepository.findByUserIdAndUsedFalse(testUserId))
                .thenReturn(List.of(backupCode));
            when(passwordEncoder.matches(eq("ABCD1234"), eq(hashedCode))).thenReturn(true);
            when(backupCodeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            // Act - use lowercase with dashes
            boolean result = mfaService.verifyBackupCode(testUserId, "abcd-1234");

            // Assert
            assertThat(result).isTrue();
            verify(passwordEncoder).matches(eq("ABCD1234"), anyString());
        }
    }

    @Nested
    @DisplayName("disableMfa")
    class DisableMfa {

        @Test
        @DisplayName("should throw exception when user not found")
        void should_ThrowException_When_UserNotFound() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.disableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
        }

        @Test
        @DisplayName("should throw exception when MFA not configured")
        void should_ThrowException_When_MfaNotConfigured() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.disableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA is not configured for this user");
        }

        @Test
        @DisplayName("should throw exception when MFA not enabled")
        void should_ThrowException_When_MfaNotEnabled() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(false)
                .secret("secret")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.disableMfa(testUserId, "123456"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("MFA is not enabled for this user");
        }

        @Test
        @DisplayName("should throw exception when MFA code is invalid")
        void should_ThrowException_When_CodeInvalid() {
            // Arrange
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("JBSWY3DPEHPK3PXP")
                .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));

            // Act & Assert
            assertThatThrownBy(() -> mfaService.disableMfa(testUserId, "000000"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid MFA code");
        }
    }

    @Nested
    @DisplayName("isMfaEnabled")
    class IsMfaEnabled {

        @Test
        @DisplayName("should return true when MFA is enabled")
        void should_ReturnTrue_When_MfaEnabled() {
            // Arrange
            when(mfaSettingsRepository.existsByUserIdAndEnabledTrue(testUserId)).thenReturn(true);

            // Act
            boolean result = mfaService.isMfaEnabled(testUserId);

            // Assert
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when MFA is not enabled")
        void should_ReturnFalse_When_MfaNotEnabled() {
            // Arrange
            when(mfaSettingsRepository.existsByUserIdAndEnabledTrue(testUserId)).thenReturn(false);

            // Act
            boolean result = mfaService.isMfaEnabled(testUserId);

            // Assert
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("getMfaStatus")
    class GetMfaStatus {

        @Test
        @DisplayName("should return disabled status when no settings exist")
        void should_ReturnDisabledStatus_When_NoSettings() {
            // Arrange
            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.empty());

            // Act
            MfaStatus status = mfaService.getMfaStatus(testUserId);

            // Assert
            assertThat(status.enabled()).isFalse();
            assertThat(status.remainingBackupCodes()).isZero();
            assertThat(status.lastVerifiedAt()).isNull();
        }

        @Test
        @DisplayName("should return full status when settings exist")
        void should_ReturnFullStatus_When_SettingsExist() {
            // Arrange
            Instant lastVerified = Instant.now();
            MfaSettings settings = MfaSettings.builder()
                .user(testUser)
                .enabled(true)
                .secret("secret")
                .lastVerifiedAt(lastVerified)
                .build();

            when(mfaSettingsRepository.findByUserId(testUserId)).thenReturn(Optional.of(settings));
            when(backupCodeRepository.countByUserIdAndUsedFalse(testUserId)).thenReturn(8L);

            // Act
            MfaStatus status = mfaService.getMfaStatus(testUserId);

            // Assert
            assertThat(status.enabled()).isTrue();
            assertThat(status.remainingBackupCodes()).isEqualTo(8L);
            assertThat(status.lastVerifiedAt()).isEqualTo(lastVerified);
        }
    }

    @Nested
    @DisplayName("generateBackupCodes")
    class GenerateBackupCodes {

        @Test
        @DisplayName("should generate 10 backup codes")
        void should_Generate10BackupCodes() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");
            when(backupCodeRepository.save(any(MfaBackupCode.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            List<String> codes = mfaService.generateBackupCodes(testUserId);

            // Assert
            assertThat(codes).hasSize(MfaBackupCode.BACKUP_CODES_COUNT);
            verify(backupCodeRepository, times(MfaBackupCode.BACKUP_CODES_COUNT)).save(any(MfaBackupCode.class));
        }

        @Test
        @DisplayName("should delete existing backup codes before generating new ones")
        void should_DeleteExistingBackupCodes() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");
            when(backupCodeRepository.save(any(MfaBackupCode.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            mfaService.generateBackupCodes(testUserId);

            // Assert
            verify(backupCodeRepository).deleteByUserId(testUserId);
        }

        @Test
        @DisplayName("should format backup codes as XXXX-XXXX")
        void should_FormatBackupCodesWithDash() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");
            when(backupCodeRepository.save(any(MfaBackupCode.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            List<String> codes = mfaService.generateBackupCodes(testUserId);

            // Assert
            for (String code : codes) {
                assertThat(code).matches("[A-Z0-9]{4}-[A-Z0-9]{4}");
            }
        }

        @Test
        @DisplayName("should throw exception when user not found")
        void should_ThrowException_When_UserNotFound() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> mfaService.generateBackupCodes(testUserId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
        }

        @Test
        @DisplayName("should hash backup codes before saving")
        void should_HashBackupCodes() {
            // Arrange
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encoded");
            when(backupCodeRepository.save(any(MfaBackupCode.class))).thenAnswer(i -> i.getArgument(0));

            // Act
            mfaService.generateBackupCodes(testUserId);

            // Assert
            verify(passwordEncoder, times(MfaBackupCode.BACKUP_CODES_COUNT)).encode(anyString());
            verify(backupCodeRepository, times(MfaBackupCode.BACKUP_CODES_COUNT)).save(backupCodeCaptor.capture());

            List<MfaBackupCode> savedCodes = backupCodeCaptor.getAllValues();
            for (MfaBackupCode code : savedCodes) {
                assertThat(code.getCodeHash()).isEqualTo("$2a$10$encoded");
                assertThat(code.isUsed()).isFalse();
            }
        }
    }

    @Nested
    @DisplayName("getRemainingBackupCodesCount")
    class GetRemainingBackupCodesCount {

        @Test
        @DisplayName("should return count of unused backup codes")
        void should_ReturnCountOfUnusedBackupCodes() {
            // Arrange
            when(backupCodeRepository.countByUserIdAndUsedFalse(testUserId)).thenReturn(7L);

            // Act
            long count = mfaService.getRemainingBackupCodesCount(testUserId);

            // Assert
            assertThat(count).isEqualTo(7L);
        }

        @Test
        @DisplayName("should return zero when no unused backup codes")
        void should_ReturnZero_When_NoUnusedCodes() {
            // Arrange
            when(backupCodeRepository.countByUserIdAndUsedFalse(testUserId)).thenReturn(0L);

            // Act
            long count = mfaService.getRemainingBackupCodesCount(testUserId);

            // Assert
            assertThat(count).isZero();
        }
    }
}
