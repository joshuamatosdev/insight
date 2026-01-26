package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.OpportunityDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.SavedOpportunity;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.SavedOpportunityRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedOpportunityService {

    private final SavedOpportunityRepository savedOpportunityRepository;
    private final OpportunityRepository opportunityRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public SavedOpportunityDto saveOpportunity(String opportunityId, String notes, String tags) {
        UUID userId = TenantContext.getCurrentUserId();
        UUID tenantId = TenantContext.getCurrentTenantId();

        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        // Check if already saved
        if (savedOpportunityRepository.existsByUserIdAndOpportunityId(userId, opportunityId)) {
            throw new IllegalArgumentException("Opportunity is already saved");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Opportunity opportunity = opportunityRepository.findById(opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Opportunity not found"));

        Tenant tenant = null;
        if (tenantId != null) {
            tenant = tenantRepository.findById(tenantId).orElse(null);
        }

        SavedOpportunity saved = SavedOpportunity.builder()
            .user(user)
            .tenant(tenant)
            .opportunity(opportunity)
            .notes(notes)
            .tags(tags)
            .build();

        saved = savedOpportunityRepository.save(saved);
        log.info("User {} saved opportunity {}", userId, opportunityId);

        return SavedOpportunityDto.fromEntity(saved);
    }

    @Transactional
    public void unsaveOpportunity(String opportunityId) {
        UUID userId = TenantContext.getCurrentUserId();

        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        savedOpportunityRepository.deleteByUserIdAndOpportunityId(userId, opportunityId);
        log.info("User {} unsaved opportunity {}", userId, opportunityId);
    }

    @Transactional
    public SavedOpportunityDto updateNotes(String opportunityId, String notes, String tags) {
        UUID userId = TenantContext.getCurrentUserId();

        SavedOpportunity saved = savedOpportunityRepository.findByUserIdAndOpportunityId(userId, opportunityId)
            .orElseThrow(() -> new IllegalArgumentException("Saved opportunity not found"));

        if (notes != null) {
            saved.setNotes(notes);
        }
        if (tags != null) {
            saved.setTags(tags);
        }

        saved = savedOpportunityRepository.save(saved);
        return SavedOpportunityDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<SavedOpportunityDto> getMySavedOpportunities(Pageable pageable) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new IllegalStateException("No authenticated user");
        }

        return savedOpportunityRepository.findByUserId(userId, pageable)
            .map(SavedOpportunityDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public boolean isOpportunitySaved(String opportunityId) {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return false;
        }

        return savedOpportunityRepository.existsByUserIdAndOpportunityId(userId, opportunityId);
    }

    @Transactional(readOnly = true)
    public Set<String> getSavedOpportunityIds() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return Set.of();
        }

        return savedOpportunityRepository.findOpportunityIdsByUserId(userId)
            .stream()
            .collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    public long getSavedCount() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            return 0;
        }

        return savedOpportunityRepository.countByUserId(userId);
    }

    public record SavedOpportunityDto(
        UUID id,
        OpportunityDto opportunity,
        String notes,
        String tags,
        Instant savedAt
    ) {
        public static SavedOpportunityDto fromEntity(SavedOpportunity entity) {
            return new SavedOpportunityDto(
                entity.getId(),
                OpportunityDto.fromEntity(entity.getOpportunity()),
                entity.getNotes(),
                entity.getTags(),
                entity.getCreatedAt()
            );
        }
    }
}
