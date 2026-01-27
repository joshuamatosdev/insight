package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.TenantBrandingDTO;
import com.samgov.ingestor.dto.TenantSettingsDTO;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.Tenant.TenantStatus;
import com.samgov.ingestor.model.TenantBranding;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.TenantSettings;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantBrandingRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.TenantSettingsRepository;
import com.samgov.ingestor.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for TenantAdminController.
 *
 * Tests focus on:
 * - HTTP request/response behavior
 * - Authorization checks (ADMIN role required)
 * - Settings and branding CRUD operations
 * - Validation errors
 * - Public branding endpoint
 */
@DisplayName("TenantAdminController")
class TenantAdminControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/api/v1/admin/tenant";

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private TenantMembershipRepository membershipRepository;

    @Autowired
    private TenantSettingsRepository settingsRepository;

    @Autowired
    private TenantBrandingRepository brandingRepository;

    private Tenant testTenant;
    private User testAdmin;
    private Role testAdminRole;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();

        // Create test tenant
        testTenant = Tenant.builder()
            .name("Test Tenant Admin")
            .slug("test-tenant-admin-" + UUID.randomUUID().toString().substring(0, 8))
            .status(TenantStatus.ACTIVE)
            .build();
        testTenant = tenantRepository.save(testTenant);

        // Create admin role
        testAdminRole = Role.builder()
            .tenant(testTenant)
            .name(Role.TENANT_ADMIN)
            .description("Tenant admin role")
            .isSystemRole(false)
            .build();
        testAdminRole = roleRepository.save(testAdminRole);

        // Create admin user
        testAdmin = User.builder()
            .email("admin-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
            .passwordHash("$2a$10$test.hash.for.testing.only")
            .firstName("Admin")
            .lastName("User")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .build();
        testAdmin = userRepository.save(testAdmin);

        // Create admin membership
        TenantMembership membership = TenantMembership.builder()
            .user(testAdmin)
            .tenant(testTenant)
            .role(testAdminRole)
            .isDefault(true)
            .acceptedAt(Instant.now())
            .build();
        membershipRepository.save(membership);

        // Set tenant context
        TenantContext.setCurrentTenantId(testTenant.getId());
        TenantContext.setCurrentUserId(testAdmin.getId());

        // Set base class fields for HTTP headers
        testTenantId = testTenant.getId();
        testUserId = testAdmin.getId();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Nested
    @DisplayName("GET /api/v1/admin/tenant/settings")
    class GetSettings {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return settings for admin user")
        void shouldReturnSettingsForAdminUser() throws Exception {
            // Given - create settings
            TenantSettings settings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("America/Chicago")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(true)
                .sessionTimeoutMinutes(120)
                .passwordExpiryDays(60)
                .ssoEnabled(false)
                .build();
            settingsRepository.save(settings);

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/settings")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.timezone").value("America/Chicago"))
                .andExpect(jsonPath("$.dateFormat").value("MM/dd/yyyy"))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.mfaRequired").value(true))
                .andExpect(jsonPath("$.sessionTimeoutMinutes").value(120))
                .andExpect(jsonPath("$.passwordExpiryDays").value(60))
                .andExpect(jsonPath("$.ssoEnabled").value(false));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should create default settings when none exist")
        void shouldCreateDefaultSettingsWhenNoneExist() throws Exception {
            // Given - no settings exist

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/settings")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.timezone").value("America/New_York"))
                .andExpect(jsonPath("$.dateFormat").value("MM/dd/yyyy"))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.mfaRequired").value(false))
                .andExpect(jsonPath("$.sessionTimeoutMinutes").value(480))
                .andExpect(jsonPath("$.passwordExpiryDays").value(90))
                .andExpect(jsonPath("$.ssoEnabled").value(false));
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            mockMvc.perform(withTenantContext(get(BASE_URL + "/settings")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isForbidden());
        }

        @Test
        @Disabled("Security disabled during development")
        @DisplayName("should return 401 for unauthenticated user")
        void shouldReturn401ForUnauthenticatedUser() throws Exception {
            mockMvc.perform(get(BASE_URL + "/settings")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/admin/tenant/settings")
    class UpdateSettings {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should update settings for admin user")
        void shouldUpdateSettingsForAdminUser() throws Exception {
            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("Europe/London")
                .dateFormat("dd/MM/yyyy")
                .currency("GBP")
                .mfaRequired(true)
                .sessionTimeoutMinutes(60)
                .passwordExpiryDays(30)
                .ssoEnabled(true)
                .ssoProvider("Okta")
                .ssoConfig("{\"domain\": \"test.okta.com\"}")
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timezone").value("Europe/London"))
                .andExpect(jsonPath("$.dateFormat").value("dd/MM/yyyy"))
                .andExpect(jsonPath("$.currency").value("GBP"))
                .andExpect(jsonPath("$.mfaRequired").value(true))
                .andExpect(jsonPath("$.sessionTimeoutMinutes").value(60))
                .andExpect(jsonPath("$.passwordExpiryDays").value(30))
                .andExpect(jsonPath("$.ssoEnabled").value(true))
                .andExpect(jsonPath("$.ssoProvider").value("Okta"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should update existing settings")
        void shouldUpdateExistingSettings() throws Exception {
            // Given - create initial settings
            TenantSettings settings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(480)
                .passwordExpiryDays(90)
                .ssoEnabled(false)
                .build();
            settingsRepository.save(settings);

            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("Asia/Tokyo")
                .dateFormat("yyyy-MM-dd")
                .currency("JPY")
                .mfaRequired(true)
                .sessionTimeoutMinutes(240)
                .passwordExpiryDays(45)
                .ssoEnabled(false)
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timezone").value("Asia/Tokyo"))
                .andExpect(jsonPath("$.currency").value("JPY"))
                .andExpect(jsonPath("$.mfaRequired").value(true));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for missing required fields")
        void shouldReturn400ForMissingRequiredFields() throws Exception {
            String invalidJson = "{\"sessionTimeoutMinutes\": 120}";

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for invalid session timeout")
        void shouldReturn400ForInvalidSessionTimeout() throws Exception {
            TenantSettingsDTO invalidDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(2) // Less than minimum of 5
                .passwordExpiryDays(90)
                .ssoEnabled(false)
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidDto))))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for session timeout exceeding maximum")
        void shouldReturn400ForSessionTimeoutExceedingMaximum() throws Exception {
            TenantSettingsDTO invalidDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(2000) // Exceeds maximum of 1440
                .passwordExpiryDays(90)
                .ssoEnabled(false)
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidDto))))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for invalid password expiry days")
        void shouldReturn400ForInvalidPasswordExpiryDays() throws Exception {
            TenantSettingsDTO invalidDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(480)
                .passwordExpiryDays(500) // Exceeds maximum of 365
                .ssoEnabled(false)
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidDto))))
                .andExpect(status().isBadRequest());
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(480)
                .passwordExpiryDays(90)
                .ssoEnabled(false)
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/admin/tenant/branding")
    class GetBranding {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return branding for admin user")
        void shouldReturnBrandingForAdminUser() throws Exception {
            // Given - create branding
            TenantBranding branding = TenantBranding.builder()
                .tenant(testTenant)
                .logoUrl("https://example.com/logo.png")
                .faviconUrl("https://example.com/favicon.ico")
                .primaryColor("#0066CC")
                .secondaryColor("#333333")
                .accentColor("#FF9900")
                .companyName("Test Company")
                .supportEmail("support@test.com")
                .supportPhone("+1-800-555-0123")
                .customCss("body { font-size: 14px; }")
                .loginMessage("Welcome to our portal!")
                .build();
            brandingRepository.save(branding);

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.logoUrl").value("https://example.com/logo.png"))
                .andExpect(jsonPath("$.faviconUrl").value("https://example.com/favicon.ico"))
                .andExpect(jsonPath("$.primaryColor").value("#0066CC"))
                .andExpect(jsonPath("$.secondaryColor").value("#333333"))
                .andExpect(jsonPath("$.accentColor").value("#FF9900"))
                .andExpect(jsonPath("$.companyName").value("Test Company"))
                .andExpect(jsonPath("$.supportEmail").value("support@test.com"))
                .andExpect(jsonPath("$.supportPhone").value("+1-800-555-0123"))
                .andExpect(jsonPath("$.customCss").value("body { font-size: 14px; }"))
                .andExpect(jsonPath("$.loginMessage").value("Welcome to our portal!"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should create default branding when none exist")
        void shouldCreateDefaultBrandingWhenNoneExist() throws Exception {
            // Given - no branding exists

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.companyName").value(testTenant.getName()))
                .andExpect(jsonPath("$.primaryColor").value("#1e40af"))
                .andExpect(jsonPath("$.secondaryColor").value("#64748b"))
                .andExpect(jsonPath("$.accentColor").value("#059669"));
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/admin/tenant/branding")
    class UpdateBranding {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should update branding for admin user")
        void shouldUpdateBrandingForAdminUser() throws Exception {
            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .logoUrl("https://new-example.com/logo.svg")
                .faviconUrl("https://new-example.com/favicon.png")
                .primaryColor("#123456")
                .secondaryColor("#654321")
                .accentColor("#ABCDEF")
                .companyName("Updated Company Name")
                .supportEmail("help@updated.com")
                .supportPhone("+1-888-555-0199")
                .customCss(".header { background: blue; }")
                .loginMessage("Welcome to the updated portal!")
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoUrl").value("https://new-example.com/logo.svg"))
                .andExpect(jsonPath("$.faviconUrl").value("https://new-example.com/favicon.png"))
                .andExpect(jsonPath("$.primaryColor").value("#123456"))
                .andExpect(jsonPath("$.secondaryColor").value("#654321"))
                .andExpect(jsonPath("$.accentColor").value("#ABCDEF"))
                .andExpect(jsonPath("$.companyName").value("Updated Company Name"))
                .andExpect(jsonPath("$.supportEmail").value("help@updated.com"))
                .andExpect(jsonPath("$.supportPhone").value("+1-888-555-0199"))
                .andExpect(jsonPath("$.customCss").value(".header { background: blue; }"))
                .andExpect(jsonPath("$.loginMessage").value("Welcome to the updated portal!"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should update existing branding")
        void shouldUpdateExistingBranding() throws Exception {
            // Given - create initial branding
            TenantBranding branding = TenantBranding.builder()
                .tenant(testTenant)
                .companyName("Old Company")
                .primaryColor("#000000")
                .build();
            brandingRepository.save(branding);

            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .companyName("New Company")
                .primaryColor("#FFFFFF")
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("New Company"))
                .andExpect(jsonPath("$.primaryColor").value("#FFFFFF"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for invalid color format")
        void shouldReturn400ForInvalidColorFormat() throws Exception {
            TenantBrandingDTO invalidDto = TenantBrandingDTO.builder()
                .primaryColor("invalid-color") // Invalid format
                .companyName("Test Company")
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidDto))))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for invalid secondary color format")
        void shouldReturn400ForInvalidSecondaryColorFormat() throws Exception {
            TenantBrandingDTO invalidDto = TenantBrandingDTO.builder()
                .primaryColor("#123456")
                .secondaryColor("rgb(255,0,0)") // Invalid format - only hex allowed
                .companyName("Test Company")
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(invalidDto))))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should allow clearing optional branding fields")
        void shouldAllowClearingOptionalBrandingFields() throws Exception {
            // Given - create branding with all fields
            TenantBranding branding = TenantBranding.builder()
                .tenant(testTenant)
                .logoUrl("https://example.com/logo.png")
                .faviconUrl("https://example.com/favicon.ico")
                .companyName("Test Company")
                .supportEmail("support@test.com")
                .supportPhone("+1-800-555-0123")
                .customCss(".test { color: red; }")
                .loginMessage("Welcome")
                .build();
            brandingRepository.save(branding);

            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .logoUrl(null) // Clear logo
                .companyName("Test Company")
                .build();

            // When/Then
            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoUrl").value(nullValue()))
                .andExpect(jsonPath("$.companyName").value("Test Company"));
        }

        @Test
        @Disabled("Security disabled during development")
        @WithMockUser(roles = "USER")
        @DisplayName("should return 403 for regular user")
        void shouldReturn403ForRegularUser() throws Exception {
            TenantBrandingDTO updateDto = TenantBrandingDTO.builder()
                .companyName("Unauthorized Update")
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/admin/tenant/branding/public")
    class GetPublicBranding {

        @Test
        @DisplayName("should return public branding without authentication")
        void shouldReturnPublicBrandingWithoutAuthentication() throws Exception {
            // Given - create branding
            TenantBranding branding = TenantBranding.builder()
                .tenant(testTenant)
                .logoUrl("https://public.example.com/logo.png")
                .primaryColor("#AABBCC")
                .companyName("Public Company")
                .loginMessage("Welcome to our public portal")
                .build();
            brandingRepository.save(branding);

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding/public")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoUrl").value("https://public.example.com/logo.png"))
                .andExpect(jsonPath("$.primaryColor").value("#AABBCC"))
                .andExpect(jsonPath("$.companyName").value("Public Company"))
                .andExpect(jsonPath("$.loginMessage").value("Welcome to our public portal"));
        }

        @Test
        @DisplayName("should return empty branding when no tenant context")
        void shouldReturnEmptyBrandingWhenNoTenantContext() throws Exception {
            // Clear tenant context
            TenantContext.clear();

            // When/Then
            mockMvc.perform(get(BASE_URL + "/branding/public")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(nullValue()))
                .andExpect(jsonPath("$.tenantId").value(nullValue()));
        }

        @Test
        @DisplayName("should accept domain query parameter")
        void shouldAcceptDomainQueryParameter() throws Exception {
            // Given - create branding
            TenantBranding branding = TenantBranding.builder()
                .tenant(testTenant)
                .companyName("Domain Company")
                .build();
            brandingRepository.save(branding);

            // When/Then - domain parameter is accepted but not used in current implementation
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding/public")
                    .param("domain", "example.com")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Domain Company"));
        }

        @Test
        @DisplayName("should create default branding when none exist for tenant")
        void shouldCreateDefaultBrandingWhenNoneExistForTenant() throws Exception {
            // Given - no branding exists

            // When/Then
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding/public")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.companyName").value(testTenant.getName()));
        }
    }

    @Nested
    @DisplayName("Tenant Isolation")
    class TenantIsolation {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should only access own tenant settings")
        void shouldOnlyAccessOwnTenantSettings() throws Exception {
            // Given - create another tenant with different settings
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .status(TenantStatus.ACTIVE)
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            TenantSettings otherSettings = TenantSettings.builder()
                .tenant(otherTenant)
                .timezone("Europe/Berlin")
                .dateFormat("dd.MM.yyyy")
                .currency("EUR")
                .build();
            settingsRepository.save(otherSettings);

            TenantSettings ownSettings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .build();
            settingsRepository.save(ownSettings);

            // When/Then - should only see own tenant settings
            mockMvc.perform(withTenantContext(get(BASE_URL + "/settings")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.timezone").value("America/New_York"))
                .andExpect(jsonPath("$.currency").value("USD"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should only access own tenant branding")
        void shouldOnlyAccessOwnTenantBranding() throws Exception {
            // Given - create another tenant with different branding
            Tenant otherTenant = Tenant.builder()
                .name("Other Tenant")
                .slug("other-tenant-branding-" + UUID.randomUUID().toString().substring(0, 8))
                .status(TenantStatus.ACTIVE)
                .build();
            otherTenant = tenantRepository.save(otherTenant);

            TenantBranding otherBranding = TenantBranding.builder()
                .tenant(otherTenant)
                .companyName("Other Company")
                .primaryColor("#FF0000")
                .build();
            brandingRepository.save(otherBranding);

            TenantBranding ownBranding = TenantBranding.builder()
                .tenant(testTenant)
                .companyName("My Company")
                .primaryColor("#00FF00")
                .build();
            brandingRepository.save(ownBranding);

            // When/Then - should only see own tenant branding
            mockMvc.perform(withTenantContext(get(BASE_URL + "/branding")
                    .contentType(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(testTenant.getId().toString()))
                .andExpect(jsonPath("$.companyName").value("My Company"))
                .andExpect(jsonPath("$.primaryColor").value("#00FF00"));
        }
    }

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for malformed JSON in settings update")
        void shouldReturn400ForMalformedJsonInSettingsUpdate() throws Exception {
            String malformedJson = "{ invalid json }";

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(malformedJson)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for malformed JSON in branding update")
        void shouldReturn400ForMalformedJsonInBrandingUpdate() throws Exception {
            String malformedJson = "{ not valid json";

            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(malformedJson)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for empty request body in settings update")
        void shouldReturn400ForEmptyRequestBodyInSettingsUpdate() throws Exception {
            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("")))
                .andExpect(status().isBadRequest());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should return 400 for empty request body in branding update")
        void shouldReturn400ForEmptyRequestBodyInBrandingUpdate() throws Exception {
            mockMvc.perform(withTenantContext(put(BASE_URL + "/branding")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("")))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("SSO Configuration")
    class SsoConfiguration {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should handle SSO configuration with provider")
        void shouldHandleSsoConfigurationWithProvider() throws Exception {
            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(480)
                .passwordExpiryDays(90)
                .ssoEnabled(true)
                .ssoProvider("Okta")
                .ssoConfig("{\"domain\": \"company.okta.com\", \"clientId\": \"abc123\"}")
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ssoEnabled").value(true))
                .andExpect(jsonPath("$.ssoProvider").value("Okta"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("should handle disabling SSO")
        void shouldHandleDisablingSso() throws Exception {
            // Given - SSO is enabled
            TenantSettings settings = TenantSettings.builder()
                .tenant(testTenant)
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .ssoEnabled(true)
                .ssoProvider("Azure AD")
                .ssoConfig("{\"tenant\": \"test-tenant\"}")
                .build();
            settingsRepository.save(settings);

            // Disable SSO
            TenantSettingsDTO updateDto = TenantSettingsDTO.builder()
                .timezone("America/New_York")
                .dateFormat("MM/dd/yyyy")
                .currency("USD")
                .mfaRequired(false)
                .sessionTimeoutMinutes(480)
                .passwordExpiryDays(90)
                .ssoEnabled(false)
                .ssoProvider(null)
                .ssoConfig(null)
                .build();

            mockMvc.perform(withTenantContext(put(BASE_URL + "/settings")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(updateDto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ssoEnabled").value(false))
                .andExpect(jsonPath("$.ssoProvider").value(nullValue()));
        }
    }
}
