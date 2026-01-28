package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.dto.TenantBrandingDTO;
import com.samgov.ingestor.dto.TenantSettingsDTO;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantBranding;
import com.samgov.ingestor.model.TenantSettings;
import com.samgov.ingestor.repository.TenantBrandingRepository;
import com.samgov.ingestor.repository.TenantSettingsRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for TenantAdminService.
 *
 * Tests focus on:
 * - Tenant settings retrieval and updates
 * - Tenant branding retrieval and updates
 * - Default value creation
 * - Error handling for non-existent tenants
 */
@DisplayName("TenantAdminService")
class TenantAdminServiceTest extends BaseServiceTest {

    @Autowired
    private TenantAdminService tenantAdminService;

    @Autowired
    private TenantSettingsRepository settingsRepository;

    @Autowired
    private TenantBrandingRepository brandingRepository;

    @Nested
    @DisplayName("Get Settings")
    class GetSettings {

        @Test
        @DisplayName("should return existing settings for tenant")
        void shouldReturnExistingSettingsForTenant() {
            // Given - create settings for the test tenant
            TenantSettings existingSettings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("Europe/London")
                .dateFormat("dd/MM/yyyy")
                .currency("GBP")
                .mfaRequired(true)
                .sessionTimeoutMinutes(120)
                .passwordExpiryDays(30)
                .ssoEnabled(true)
                .ssoProvider("Okta")
                .ssoConfig("{\"domain\": \"example.okta.com\"}")
                .build();
            settingsRepository.save(existingSettings);

            // When
            TenantSettingsDTO result = tenantAdminService.getSettings(testTenant.getId());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(result.getTimezone()).isEqualTo("Europe/London");
            assertThat(result.getDateFormat()).isEqualTo("dd/MM/yyyy");
            assertThat(result.getCurrency()).isEqualTo("GBP");
            assertThat(result.isMfaRequired()).isTrue();
            assertThat(result.getSessionTimeoutMinutes()).isEqualTo(120);
            assertThat(result.getPasswordExpiryDays()).isEqualTo(30);
            assertThat(result.isSsoEnabled()).isTrue();
            assertThat(result.getSsoProvider()).isEqualTo("Okta");
        }

        @Test
        @DisplayName("should create default settings when none exist")
        void shouldCreateDefaultSettingsWhenNoneExist() {
            // Given - no settings exist for testTenant

            // When
            TenantSettingsDTO result = tenantAdminService.getSettings(testTenant.getId());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(result.getTimezone()).isEqualTo("America/New_York");
            assertThat(result.getDateFormat()).isEqualTo("MM/dd/yyyy");
            assertThat(result.getCurrency()).isEqualTo("USD");
            assertThat(result.isMfaRequired()).isFalse();
            assertThat(result.getSessionTimeoutMinutes()).isEqualTo(480);
            assertThat(result.getPasswordExpiryDays()).isEqualTo(90);
            assertThat(result.isSsoEnabled()).isFalse();

            // Verify settings were persisted
            Optional<TenantSettings> savedSettings = settingsRepository.findByTenantId(testTenant.getId());
            assertThat(savedSettings).isPresent();
        }

        @Test
        @DisplayName("should throw exception for non-existent tenant")
        void shouldThrowExceptionForNonExistentTenant() {
            // Given
            UUID nonExistentTenantId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> tenantAdminService.getSettings(nonExistentTenantId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }
    }

    @Nested
    @DisplayName("Update Settings")
    class UpdateSettings {

        @Test
        @DisplayName("should update existing settings")
        void shouldUpdateExistingSettings() {
            // Given - create initial settings
            TenantSettings initialSettings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(480)
                .passwordExpiryDays(90)
                .ssoEnabled(false)
                .build();
            settingsRepository.save(initialSettings);

            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("Asia/Tokyo")
                .dateFormat("yyyy-MM-dd")
                .currency("JPY")
                .mfaRequired(true)
                .sessionTimeoutMinutes(60)
                .passwordExpiryDays(45)
                .ssoEnabled(true)
                .ssoProvider("Azure AD")
                .ssoConfig("{\"tenant\": \"test-tenant-id\"}")
                .build();

            // When
            TenantSettingsDTO result = tenantAdminService.updateSettings(testTenant.getId(), updateDto);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTimezone()).isEqualTo("Asia/Tokyo");
            assertThat(result.getDateFormat()).isEqualTo("yyyy-MM-dd");
            assertThat(result.getCurrency()).isEqualTo("JPY");
            assertThat(result.isMfaRequired()).isTrue();
            assertThat(result.getSessionTimeoutMinutes()).isEqualTo(60);
            assertThat(result.getPasswordExpiryDays()).isEqualTo(45);
            assertThat(result.isSsoEnabled()).isTrue();
            assertThat(result.getSsoProvider()).isEqualTo("Azure AD");
        }

        @Test
        @DisplayName("should create settings on update when none exist")
        void shouldCreateSettingsOnUpdateWhenNoneExist() {
            // Given - no settings exist
            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("Europe/Paris")
                .dateFormat("dd-MM-yyyy")
                .currency("EUR")
                .mfaRequired(true)
                .sessionTimeoutMinutes(240)
                .passwordExpiryDays(60)
                .ssoEnabled(false)
                .build();

            // When
            TenantSettingsDTO result = tenantAdminService.updateSettings(testTenant.getId(), updateDto);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTimezone()).isEqualTo("Europe/Paris");
            assertThat(result.getCurrency()).isEqualTo("EUR");

            // Verify settings were persisted
            Optional<TenantSettings> savedSettings = settingsRepository.findByTenantId(testTenant.getId());
            assertThat(savedSettings).isPresent();
            assertThat(savedSettings.get().getTimezone()).isEqualTo("Europe/Paris");
        }

        @Test
        @DisplayName("should throw exception for non-existent tenant on update")
        void shouldThrowExceptionForNonExistentTenantOnUpdate() {
            // Given
            UUID nonExistentTenantId = UUID.randomUUID();
            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .build();

            // When/Then
            assertThatThrownBy(() -> tenantAdminService.updateSettings(nonExistentTenantId, updateDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }

        @Test
        @DisplayName("should preserve settings id after update")
        void shouldPreserveSettingsIdAfterUpdate() {
            // Given - create initial settings
            TenantSettings initialSettings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .build();
            TenantSettings savedSettings = settingsRepository.save(initialSettings);
            UUID originalId = savedSettings.getId();

            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("Europe/Berlin")
                .dateFormat("dd.MM.yyyy")
                .currency("EUR")
                .mfaRequired(false)
                .sessionTimeoutMinutes(300)
                .passwordExpiryDays(60)
                .ssoEnabled(false)
                .build();

            // When
            TenantSettingsDTO result = tenantAdminService.updateSettings(testTenant.getId(), updateDto);

            // Then
            assertThat(result.getId()).isEqualTo(originalId);
        }
    }

    @Nested
    @DisplayName("Get Branding")
    class GetBranding {

        @Test
        @DisplayName("should return existing branding for tenant")
        void shouldReturnExistingBrandingForTenant() {
            // Given - create branding for the test tenant
            TenantBranding existingBranding = TenantBranding.builder()
                .tenant(testTenant)
                .logoUrl("https://example.com/logo.png")
                .faviconUrl("https://example.com/favicon.ico")
                .primaryColor("#FF5733")
                .secondaryColor("#333333")
                .accentColor("#00FF00")
                .companyName("Acme Corp")
                .supportEmail("support@acme.com")
                .supportPhone("+1-800-555-0123")
                .customCss(".header { background: red; }")
                .loginMessage("Welcome to Acme Portal")
                .build();
            brandingRepository.save(existingBranding);

            // When
            TenantBrandingDTO result = tenantAdminService.getBranding(testTenant.getId());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(result.getLogoUrl()).isEqualTo("https://example.com/logo.png");
            assertThat(result.getFaviconUrl()).isEqualTo("https://example.com/favicon.ico");
            assertThat(result.getPrimaryColor()).isEqualTo("#FF5733");
            assertThat(result.getSecondaryColor()).isEqualTo("#333333");
            assertThat(result.getAccentColor()).isEqualTo("#00FF00");
            assertThat(result.getCompanyName()).isEqualTo("Acme Corp");
            assertThat(result.getSupportEmail()).isEqualTo("support@acme.com");
            assertThat(result.getSupportPhone()).isEqualTo("+1-800-555-0123");
            assertThat(result.getCustomCss()).isEqualTo(".header { background: red; }");
            assertThat(result.getLoginMessage()).isEqualTo("Welcome to Acme Portal");
        }

        @Test
        @DisplayName("should create default branding when none exist")
        void shouldCreateDefaultBrandingWhenNoneExist() {
            // Given - no branding exists for testTenant

            // When
            TenantBrandingDTO result = tenantAdminService.getBranding(testTenant.getId());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(result.getCompanyName()).isEqualTo(testTenant.getName());
            assertThat(result.getPrimaryColor()).isEqualTo("#1e40af");
            assertThat(result.getSecondaryColor()).isEqualTo("#64748b");
            assertThat(result.getAccentColor()).isEqualTo("#059669");

            // Verify branding was persisted
            Optional<TenantBranding> savedBranding = brandingRepository.findByTenantId(testTenant.getId());
            assertThat(savedBranding).isPresent();
        }

        @Test
        @DisplayName("should throw exception for non-existent tenant")
        void shouldThrowExceptionForNonExistentTenant() {
            // Given
            UUID nonExistentTenantId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> tenantAdminService.getBranding(nonExistentTenantId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }
    }

    @Nested
    @DisplayName("Update Branding")
    class UpdateBranding {

        @Test
        @DisplayName("should update existing branding")
        void shouldUpdateExistingBranding() {
            // Given - create initial branding
            TenantBranding initialBranding = TenantBranding.builder()
                .tenant(testTenant)
                .companyName("Old Company Name")
                .primaryColor("#000000")
                .build();
            brandingRepository.save(initialBranding);

            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .logoUrl("https://new-logo.com/logo.svg")
                .faviconUrl("https://new-logo.com/favicon.png")
                .primaryColor("#0066CC")
                .secondaryColor("#CCCCCC")
                .accentColor("#FF9900")
                .companyName("New Company Name")
                .supportEmail("help@newcompany.com")
                .supportPhone("+1-888-555-0199")
                .customCss("body { font-family: 'Arial'; }")
                .loginMessage("Welcome back!")
                .build();

            // When
            TenantBrandingDTO result = tenantAdminService.updateBranding(testTenant.getId(), updateDto);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getLogoUrl()).isEqualTo("https://new-logo.com/logo.svg");
            assertThat(result.getFaviconUrl()).isEqualTo("https://new-logo.com/favicon.png");
            assertThat(result.getPrimaryColor()).isEqualTo("#0066CC");
            assertThat(result.getSecondaryColor()).isEqualTo("#CCCCCC");
            assertThat(result.getAccentColor()).isEqualTo("#FF9900");
            assertThat(result.getCompanyName()).isEqualTo("New Company Name");
            assertThat(result.getSupportEmail()).isEqualTo("help@newcompany.com");
            assertThat(result.getSupportPhone()).isEqualTo("+1-888-555-0199");
            assertThat(result.getCustomCss()).isEqualTo("body { font-family: 'Arial'; }");
            assertThat(result.getLoginMessage()).isEqualTo("Welcome back!");
        }

        @Test
        @DisplayName("should create branding on update when none exist")
        void shouldCreateBrandingOnUpdateWhenNoneExist() {
            // Given - no branding exists
            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .logoUrl("https://brand-new.com/logo.png")
                .primaryColor("#123456")
                .secondaryColor("#654321")
                .accentColor("#ABCDEF")
                .companyName("Brand New Company")
                .supportEmail("contact@brandnew.com")
                .build();

            // When
            TenantBrandingDTO result = tenantAdminService.updateBranding(testTenant.getId(), updateDto);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getLogoUrl()).isEqualTo("https://brand-new.com/logo.png");
            assertThat(result.getPrimaryColor()).isEqualTo("#123456");
            assertThat(result.getCompanyName()).isEqualTo("Brand New Company");

            // Verify branding was persisted
            Optional<TenantBranding> savedBranding = brandingRepository.findByTenantId(testTenant.getId());
            assertThat(savedBranding).isPresent();
            assertThat(savedBranding.get().getLogoUrl()).isEqualTo("https://brand-new.com/logo.png");
        }

        @Test
        @DisplayName("should throw exception for non-existent tenant on update")
        void shouldThrowExceptionForNonExistentTenantOnUpdate() {
            // Given
            UUID nonExistentTenantId = UUID.randomUUID();
            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .companyName("Test Company")
                .primaryColor("#000000")
                .build();

            // When/Then
            assertThatThrownBy(() -> tenantAdminService.updateBranding(nonExistentTenantId, updateDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tenant not found");
        }

        @Test
        @DisplayName("should preserve branding id after update")
        void shouldPreserveBrandingIdAfterUpdate() {
            // Given - create initial branding
            TenantBranding initialBranding = TenantBranding.builder()
                .tenant(testTenant)
                .companyName("Initial Company")
                .primaryColor("#000000")
                .build();
            TenantBranding savedBranding = brandingRepository.save(initialBranding);
            UUID originalId = savedBranding.getId();

            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .companyName("Updated Company")
                .primaryColor("#FFFFFF")
                .build();

            // When
            TenantBrandingDTO result = tenantAdminService.updateBranding(testTenant.getId(), updateDto);

            // Then
            assertThat(result.getId()).isEqualTo(originalId);
        }

        @Test
        @DisplayName("should allow clearing optional branding fields")
        void shouldAllowClearingOptionalBrandingFields() {
            // Given - create branding with all fields populated
            TenantBranding initialBranding = TenantBranding.builder()
                .tenant(testTenant)
                .logoUrl("https://example.com/logo.png")
                .faviconUrl("https://example.com/favicon.ico")
                .companyName("Company Name")
                .supportEmail("support@example.com")
                .supportPhone("+1-800-555-0123")
                .customCss(".test { color: red; }")
                .loginMessage("Welcome message")
                .build();
            brandingRepository.save(initialBranding);

            // Update with null values to clear optional fields
            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .logoUrl(null)
                .faviconUrl(null)
                .companyName("Company Name")
                .supportEmail(null)
                .supportPhone(null)
                .customCss(null)
                .loginMessage(null)
                .build();

            // When
            TenantBrandingDTO result = tenantAdminService.updateBranding(testTenant.getId(), updateDto);

            // Then
            assertThat(result.getLogoUrl()).isNull();
            assertThat(result.getFaviconUrl()).isNull();
            assertThat(result.getSupportEmail()).isNull();
            assertThat(result.getSupportPhone()).isNull();
            assertThat(result.getCustomCss()).isNull();
            assertThat(result.getLoginMessage()).isNull();
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    class TenantIsolation {

        @Test
        @DisplayName("should maintain settings isolation between tenants")
        void shouldMaintainSettingsIsolationBetweenTenants() {
            // Given - create two tenants with different settings
            Tenant tenantAEntity = Tenant.builder()
                .name("Tenant A")
                .slug("tenant-a-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant tenantA = tenantRepository.save(tenantAEntity);

            Tenant tenantBEntity = Tenant.builder()
                .name("Tenant B")
                .slug("tenant-b-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant tenantB = tenantRepository.save(tenantBEntity);

            // Create settings for tenant A
            TenantSettingsDTO settingsA = TenantSettingsDTO.builder()
                .timezone("America/Los_Angeles")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(true)
                .sessionTimeoutMinutes(60)
                .passwordExpiryDays(30)
                .ssoEnabled(false)
                .build();
            tenantAdminService.updateSettings(tenantA.getId(), settingsA);

            // Create settings for tenant B
            TenantSettingsDTO settingsB = TenantSettingsDTO.builder()
                .timezone("Europe/Paris")
                .dateFormat("dd/MM/yyyy")
                .currency("EUR")
                .mfaRequired(false)
                .sessionTimeoutMinutes(120)
                .passwordExpiryDays(60)
                .ssoEnabled(true)
                .ssoProvider("SAML")
                .build();
            tenantAdminService.updateSettings(tenantB.getId(), settingsB);

            // When
            TenantSettingsDTO resultA = tenantAdminService.getSettings(tenantA.getId());
            TenantSettingsDTO resultB = tenantAdminService.getSettings(tenantB.getId());

            // Then - each tenant has its own settings
            assertThat(resultA.getTimezone()).isEqualTo("America/Los_Angeles");
            assertThat(resultA.getCurrency()).isEqualTo("USD");
            assertThat(resultA.isMfaRequired()).isTrue();

            assertThat(resultB.getTimezone()).isEqualTo("Europe/Paris");
            assertThat(resultB.getCurrency()).isEqualTo("EUR");
            assertThat(resultB.isMfaRequired()).isFalse();
        }

        @Test
        @DisplayName("should maintain branding isolation between tenants")
        void shouldMaintainBrandingIsolationBetweenTenants() {
            // Given - create two tenants with different branding
            Tenant tenantAEntity = Tenant.builder()
                .name("Tenant A Corp")
                .slug("tenant-a-corp-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant tenantA = tenantRepository.save(tenantAEntity);

            Tenant tenantBEntity = Tenant.builder()
                .name("Tenant B Inc")
                .slug("tenant-b-inc-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            final Tenant tenantB = tenantRepository.save(tenantBEntity);

            // Create branding for tenant A
            TenantBrandingDTO brandingA = TenantBrandingDTO.builder()
                .companyName("Tenant A Corp")
                .primaryColor("#FF0000")
                .supportEmail("support@tenanta.com")
                .build();
            tenantAdminService.updateBranding(tenantA.getId(), brandingA);

            // Create branding for tenant B
            TenantBrandingDTO brandingB = TenantBrandingDTO.builder()
                .companyName("Tenant B Inc")
                .primaryColor("#00FF00")
                .supportEmail("help@tenantb.com")
                .build();
            tenantAdminService.updateBranding(tenantB.getId(), brandingB);

            // When
            TenantBrandingDTO resultA = tenantAdminService.getBranding(tenantA.getId());
            TenantBrandingDTO resultB = tenantAdminService.getBranding(tenantB.getId());

            // Then - each tenant has its own branding
            assertThat(resultA.getCompanyName()).isEqualTo("Tenant A Corp");
            assertThat(resultA.getPrimaryColor()).isEqualTo("#FF0000");
            assertThat(resultA.getSupportEmail()).isEqualTo("support@tenanta.com");

            assertThat(resultB.getCompanyName()).isEqualTo("Tenant B Inc");
            assertThat(resultB.getPrimaryColor()).isEqualTo("#00FF00");
            assertThat(resultB.getSupportEmail()).isEqualTo("help@tenantb.com");
        }
    }

    @Nested
    @DisplayName("DTO Conversion")
    class DtoConversion {

        @Test
        @DisplayName("should correctly convert settings entity to DTO")
        void shouldCorrectlyConvertSettingsEntityToDto() {
            // Given
            TenantSettings settings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("UTC")
                .dateFormat("yyyy-MM-dd")
                .currency("CHF")
                .mfaRequired(true)
                .sessionTimeoutMinutes(30)
                .passwordExpiryDays(14)
                .ssoEnabled(true)
                .ssoProvider("Google")
                .ssoConfig("{\"clientId\": \"test-id\"}")
                .build();
            settings = settingsRepository.save(settings);

            // When
            TenantSettingsDTO dto = TenantSettingsDTO.fromEntity(settings);

            // Then
            assertThat(dto.getId()).isEqualTo(settings.getId());
            assertThat(dto.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(dto.getTimezone()).isEqualTo("UTC");
            assertThat(dto.getDateFormat()).isEqualTo("yyyy-MM-dd");
            assertThat(dto.getCurrency()).isEqualTo("CHF");
            assertThat(dto.isMfaRequired()).isTrue();
            assertThat(dto.getSessionTimeoutMinutes()).isEqualTo(30);
            assertThat(dto.getPasswordExpiryDays()).isEqualTo(14);
            assertThat(dto.isSsoEnabled()).isTrue();
            assertThat(dto.getSsoProvider()).isEqualTo("Google");
        }

        @Test
        @DisplayName("should correctly convert branding entity to DTO")
        void shouldCorrectlyConvertBrandingEntityToDto() {
            // Given
            TenantBranding branding = TenantBranding.builder()
                .tenant(testTenant)
                .logoUrl("https://test.com/logo.png")
                .faviconUrl("https://test.com/favicon.ico")
                .primaryColor("#AABBCC")
                .secondaryColor("#112233")
                .accentColor("#445566")
                .companyName("Test Company")
                .supportEmail("test@test.com")
                .supportPhone("+1234567890")
                .customCss("body { margin: 0; }")
                .loginMessage("Test login message")
                .build();
            branding = brandingRepository.save(branding);

            // When
            TenantBrandingDTO dto = TenantBrandingDTO.fromEntity(branding);

            // Then
            assertThat(dto.getId()).isEqualTo(branding.getId());
            assertThat(dto.getTenantId()).isEqualTo(testTenant.getId());
            assertThat(dto.getLogoUrl()).isEqualTo("https://test.com/logo.png");
            assertThat(dto.getFaviconUrl()).isEqualTo("https://test.com/favicon.ico");
            assertThat(dto.getPrimaryColor()).isEqualTo("#AABBCC");
            assertThat(dto.getSecondaryColor()).isEqualTo("#112233");
            assertThat(dto.getAccentColor()).isEqualTo("#445566");
            assertThat(dto.getCompanyName()).isEqualTo("Test Company");
            assertThat(dto.getSupportEmail()).isEqualTo("test@test.com");
            assertThat(dto.getSupportPhone()).isEqualTo("+1234567890");
            assertThat(dto.getCustomCss()).isEqualTo("body { margin: 0; }");
            assertThat(dto.getLoginMessage()).isEqualTo("Test login message");
        }

        @Test
        @DisplayName("should return null when converting null settings entity")
        void shouldReturnNullWhenConvertingNullSettingsEntity() {
            // When
            TenantSettingsDTO dto = TenantSettingsDTO.fromEntity(null);

            // Then
            assertThat(dto).isNull();
        }

        @Test
        @DisplayName("should return null when converting null branding entity")
        void shouldReturnNullWhenConvertingNullBrandingEntity() {
            // When
            TenantBrandingDTO dto = TenantBrandingDTO.fromEntity(null);

            // Then
            assertThat(dto).isNull();
        }
    }
}
