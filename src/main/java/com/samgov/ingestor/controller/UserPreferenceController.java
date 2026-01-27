package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.UserPreferenceService;
import com.samgov.ingestor.service.UserPreferenceService.UpdatePreferencesRequest;
import com.samgov.ingestor.service.UserPreferenceService.UserPreferenceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    /**
     * Get current user's preferences.
     */
    @GetMapping
    public ResponseEntity<UserPreferenceDto> getPreferences() {
        UserPreferenceDto preferences = userPreferenceService.getPreferences();
        return ResponseEntity.ok(preferences);
    }

    /**
     * Update current user's preferences.
     */
    @PutMapping
    public ResponseEntity<UserPreferenceDto> updatePreferences(
        @RequestBody UpdatePreferencesRequest request
    ) {
        UserPreferenceDto preferences = userPreferenceService.updatePreferences(request);
        return ResponseEntity.ok(preferences);
    }
}
