package com.samgov.ingestor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.SavedSearch;
import com.samgov.ingestor.model.SavedSearch.AlertFrequency;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.SavedSearchRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import com.samgov.ingestor.service.OpportunityService.OpportunitySearchRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedSearchService {

    private final SavedSearchRepository savedSearchRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final ObjectMapper objectMapper;

    private static final int MAX_SAVED_SEARCHES_PER_USER = 20;

    @Transactional
    public SavedSearchDto createSavedSearch(CreateSavedSearchRequest request) {
        UUID userId = TenantContext.getCurrentUserId();
        UUID tenantId = TenantContext.getCurrentTenantId();

        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check limit
        long currentCount = savedSearchRepository.countByUserId(userId);
        if (currentCount >= MAX_SAVED_SEARCHES_PER_USER) {
            throw new IllegalStateException("Maximum saved searches limit reached (" + MAX_SAVED_SEARCHES_PER_USER + ")");
        }

        // Check for duplicate name
        if (savedSearchRepository.existsByUserIdAndName(userId, request.name())) {
            throw new IllegalArgumentException("A saved search with this name already exists");
        }

        String criteriaJson;
        try {
            criteriaJson = objectMapper.writeValueAsString(request.searchCriteria());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize search criteria", e);
        }

        Tenant tenant = null;
        if (tenantId != null) {
            tenant = tenantRepository.findById(tenantId).orElse(null);
        }

        SavedSearch savedSearch = SavedSearch.builder()
            .user(user)
            .tenant(tenant)
            .name(request.name())
            .description(request.description())
            .searchCriteria(criteriaJson)
            .alertEnabled(request.alertEnabled() != null && request.alertEnabled())
            .alertFrequency(request.alertFrequency())
            .isDefault(false)
            .build();

        savedSearch = savedSearchRepository.save(savedSearch);
        log.info("Created saved search {} for user {}", savedSearch.getId(), userId);

        return SavedSearchDto.fromEntity(savedSearch, objectMapper);
    }

    @Transactional(readOnly = true)
    public List<SavedSearchDto> getUserSavedSearches() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return savedSearchRepository.findByUserId(userId)
            .stream()
            .map(s -> SavedSearchDto.fromEntity(s, objectMapper))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<SavedSearchDto> getSavedSearchById(UUID id) {
        return savedSearchRepository.findById(id)
            .map(s -> SavedSearchDto.fromEntity(s, objectMapper));
    }

    @Transactional
    public SavedSearchDto updateSavedSearch(UUID id, UpdateSavedSearchRequest request) {
        UUID userId = TenantContext.getCurrentUserId();

        SavedSearch savedSearch = savedSearchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Saved search not found"));

        if (!savedSearch.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        if (request.name() != null && !request.name().equals(savedSearch.getName())) {
            if (savedSearchRepository.existsByUserIdAndName(userId, request.name())) {
                throw new IllegalArgumentException("A saved search with this name already exists");
            }
            savedSearch.setName(request.name());
        }

        if (request.description() != null) {
            savedSearch.setDescription(request.description());
        }

        if (request.searchCriteria() != null) {
            try {
                String criteriaJson = objectMapper.writeValueAsString(request.searchCriteria());
                savedSearch.setSearchCriteria(criteriaJson);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize search criteria", e);
            }
        }

        if (request.alertEnabled() != null) {
            savedSearch.setAlertEnabled(request.alertEnabled());
        }

        if (request.alertFrequency() != null) {
            savedSearch.setAlertFrequency(request.alertFrequency());
        }

        savedSearch = savedSearchRepository.save(savedSearch);
        return SavedSearchDto.fromEntity(savedSearch, objectMapper);
    }

    @Transactional
    public void deleteSavedSearch(UUID id) {
        UUID userId = TenantContext.getCurrentUserId();

        SavedSearch savedSearch = savedSearchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Saved search not found"));

        if (!savedSearch.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        savedSearchRepository.delete(savedSearch);
        log.info("Deleted saved search {} for user {}", id, userId);
    }

    @Transactional
    public void setAsDefault(UUID id) {
        UUID userId = TenantContext.getCurrentUserId();

        SavedSearch savedSearch = savedSearchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Saved search not found"));

        if (!savedSearch.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        // Clear existing default
        savedSearchRepository.findByUserIdAndIsDefaultTrue(userId)
            .ifPresent(existing -> {
                existing.setIsDefault(false);
                savedSearchRepository.save(existing);
            });

        savedSearch.setIsDefault(true);
        savedSearchRepository.save(savedSearch);
    }

    public record CreateSavedSearchRequest(
        String name,
        String description,
        OpportunitySearchRequest searchCriteria,
        Boolean alertEnabled,
        AlertFrequency alertFrequency
    ) {}

    public record UpdateSavedSearchRequest(
        String name,
        String description,
        OpportunitySearchRequest searchCriteria,
        Boolean alertEnabled,
        AlertFrequency alertFrequency
    ) {}

    public record SavedSearchDto(
        UUID id,
        String name,
        String description,
        OpportunitySearchRequest searchCriteria,
        Boolean alertEnabled,
        AlertFrequency alertFrequency,
        Boolean isDefault,
        Integer lastResultCount,
        java.time.Instant createdAt,
        java.time.Instant updatedAt
    ) {
        public static SavedSearchDto fromEntity(SavedSearch entity, ObjectMapper objectMapper) {
            OpportunitySearchRequest criteria = null;
            try {
                criteria = objectMapper.readValue(entity.getSearchCriteria(), OpportunitySearchRequest.class);
            } catch (JsonProcessingException e) {
                // Log and continue with null criteria
            }

            return new SavedSearchDto(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                criteria,
                entity.getAlertEnabled(),
                entity.getAlertFrequency(),
                entity.getIsDefault(),
                entity.getLastResultCount(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            );
        }
    }
}
