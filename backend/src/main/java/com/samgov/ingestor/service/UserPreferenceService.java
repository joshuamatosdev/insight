package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.UserPreference;
import com.samgov.ingestor.model.UserPreference.Theme;
import com.samgov.ingestor.repository.UserPreferenceRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;
    private final UserRepository userRepository;

    /**
     * Get preferences for the current authenticated user.
     * Creates default preferences if none exist.
     */
    @Transactional
    public UserPreferenceDto getPreferences() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return getPreferences(userId);
    }

    /**
     * Get preferences for a specific user.
     * Creates default preferences if none exist.
     */
    @Transactional
    public UserPreferenceDto getPreferences(UUID userId) {
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));

        return UserPreferenceDto.fromEntity(preferences);
    }

    /**
     * Update preferences for the current authenticated user.
     */
    @Transactional
    public UserPreferenceDto updatePreferences(UpdatePreferencesRequest request) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return updatePreferences(userId, request);
    }

    /**
     * Update preferences for a specific user.
     */
    @Transactional
    public UserPreferenceDto updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultPreferences(userId));

        if (request.theme() != null) {
            preferences.setTheme(request.theme());
        }
        if (request.emailNotifications() != null) {
            preferences.setEmailNotifications(request.emailNotifications());
        }
        if (request.dashboardLayout() != null) {
            preferences.setDashboardLayout(request.dashboardLayout());
        }
        if (request.timezone() != null) {
            preferences.setTimezone(request.timezone());
        }
        if (request.language() != null) {
            preferences.setLanguage(request.language());
        }

        preferences = userPreferenceRepository.save(preferences);
        log.debug("Updated preferences for user {}", userId);

        return UserPreferenceDto.fromEntity(preferences);
    }

    /**
     * Create default preferences for a user.
     */
    private UserPreference createDefaultPreferences(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserPreference preferences = UserPreference.builder()
            .user(user)
            .theme(Theme.SYSTEM)
            .emailNotifications(true)
            .timezone("America/New_York")
            .language("en")
            .build();

        preferences = userPreferenceRepository.save(preferences);
        log.debug("Created default preferences for user {}", userId);

        return preferences;
    }

    /**
     * DTO for user preferences.
     */
    public record UserPreferenceDto(
        UUID id,
        UUID userId,
        Theme theme,
        Boolean emailNotifications,
        String dashboardLayout,
        String timezone,
        String language
    ) {
        public static UserPreferenceDto fromEntity(UserPreference entity) {
            return new UserPreferenceDto(
                entity.getId(),
                entity.getUser().getId(),
                entity.getTheme(),
                entity.getEmailNotifications(),
                entity.getDashboardLayout(),
                entity.getTimezone(),
                entity.getLanguage()
            );
        }
    }

    /**
     * Request DTO for updating preferences.
     */
    public record UpdatePreferencesRequest(
        Theme theme,
        Boolean emailNotifications,
        String dashboardLayout,
        String timezone,
        String language
    ) {}
}
