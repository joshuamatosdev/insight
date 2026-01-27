package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.BadRequestException;
import com.samgov.ingestor.exception.ForbiddenException;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.OpportunityAlert;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityAlertRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpportunityAlertService {

    private final OpportunityAlertRepository opportunityAlertRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    /**
     * Get all opportunity alerts for the current user.
     */
    @Transactional(readOnly = true)
    public Page<OpportunityAlertDto> getMyAlerts(Pageable pageable) {
        UUID userId = requireCurrentUserId();
        return opportunityAlertRepository.findByUserId(userId, pageable)
            .map(OpportunityAlertDto::fromEntity);
    }

    /**
     * Get a specific alert by ID (validates ownership).
     */
    @Transactional(readOnly = true)
    public OpportunityAlertDto getAlert(UUID alertId) {
        UUID userId = requireCurrentUserId();
        OpportunityAlert alert = opportunityAlertRepository.findByIdAndUserId(alertId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        return OpportunityAlertDto.fromEntity(alert);
    }

    /**
     * Create a new opportunity alert.
     */
    @Transactional
    public OpportunityAlertDto createAlert(CreateOpportunityAlertRequest request) {
        UUID userId = requireCurrentUserId();
        UUID tenantId = TenantContext.getCurrentTenantId();

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check for duplicate name
        if (opportunityAlertRepository.existsByUserIdAndName(userId, request.name())) {
            throw new BadRequestException("An alert with this name already exists");
        }

        Tenant tenant = null;
        if (tenantId != null) {
            tenant = tenantRepository.findById(tenantId).orElse(null);
        }

        OpportunityAlert alert = OpportunityAlert.builder()
            .user(user)
            .tenant(tenant)
            .name(request.name())
            .description(request.description())
            .naicsCodes(request.naicsCodes() != null ? new ArrayList<>(request.naicsCodes()) : new ArrayList<>())
            .keywords(request.keywords() != null ? new ArrayList<>(request.keywords()) : new ArrayList<>())
            .minValue(request.minValue())
            .maxValue(request.maxValue())
            .enabled(request.enabled() != null ? request.enabled() : true)
            .build();

        alert = opportunityAlertRepository.save(alert);
        log.info("Created opportunity alert {} for user {}", alert.getId(), userId);

        return OpportunityAlertDto.fromEntity(alert);
    }

    /**
     * Update an existing opportunity alert.
     */
    @Transactional
    public OpportunityAlertDto updateAlert(UUID alertId, UpdateOpportunityAlertRequest request) {
        UUID userId = requireCurrentUserId();

        OpportunityAlert alert = opportunityAlertRepository.findByIdAndUserId(alertId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        // Check for duplicate name if name is being changed
        if (request.name() != null && !request.name().equals(alert.getName())) {
            if (opportunityAlertRepository.existsByUserIdAndNameExcludingId(userId, request.name(), alertId)) {
                throw new BadRequestException("An alert with this name already exists");
            }
            alert.setName(request.name());
        }

        if (request.description() != null) {
            alert.setDescription(request.description());
        }

        if (request.naicsCodes() != null) {
            alert.setNaicsCodes(new ArrayList<>(request.naicsCodes()));
        }

        if (request.keywords() != null) {
            alert.setKeywords(new ArrayList<>(request.keywords()));
        }

        if (request.minValue() != null) {
            alert.setMinValue(request.minValue());
        }

        if (request.maxValue() != null) {
            alert.setMaxValue(request.maxValue());
        }

        if (request.enabled() != null) {
            alert.setEnabled(request.enabled());
        }

        alert = opportunityAlertRepository.save(alert);
        log.info("Updated opportunity alert {} for user {}", alert.getId(), userId);

        return OpportunityAlertDto.fromEntity(alert);
    }

    /**
     * Delete an opportunity alert.
     */
    @Transactional
    public void deleteAlert(UUID alertId) {
        UUID userId = requireCurrentUserId();

        OpportunityAlert alert = opportunityAlertRepository.findByIdAndUserId(alertId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        opportunityAlertRepository.delete(alert);
        log.info("Deleted opportunity alert {} for user {}", alertId, userId);
    }

    /**
     * Toggle the enabled status of an alert.
     */
    @Transactional
    public OpportunityAlertDto toggleAlert(UUID alertId) {
        UUID userId = requireCurrentUserId();

        OpportunityAlert alert = opportunityAlertRepository.findByIdAndUserId(alertId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));

        alert.setEnabled(!alert.getEnabled());
        alert = opportunityAlertRepository.save(alert);

        log.info("Toggled opportunity alert {} to enabled={} for user {}", alertId, alert.getEnabled(), userId);
        return OpportunityAlertDto.fromEntity(alert);
    }

    /**
     * Evaluate an opportunity against all enabled alerts for a user.
     * Returns a list of alerts that match the opportunity.
     */
    @Transactional(readOnly = true)
    public List<OpportunityAlertDto> evaluateOpportunityForUser(UUID userId, Opportunity opportunity) {
        List<OpportunityAlert> enabledAlerts = opportunityAlertRepository.findByUserIdAndEnabledTrue(userId);
        List<OpportunityAlertDto> matchingAlerts = new ArrayList<>();

        for (OpportunityAlert alert : enabledAlerts) {
            if (matchesAlert(opportunity, alert)) {
                matchingAlerts.add(OpportunityAlertDto.fromEntity(alert));
            }
        }

        return matchingAlerts;
    }

    /**
     * Evaluate an opportunity against all enabled alerts.
     * Returns a list of (userId, alertId) pairs for matching alerts.
     */
    @Transactional(readOnly = true)
    public List<AlertMatch> evaluateOpportunity(Opportunity opportunity) {
        List<OpportunityAlert> enabledAlerts = opportunityAlertRepository.findByEnabledTrue();
        List<AlertMatch> matches = new ArrayList<>();

        for (OpportunityAlert alert : enabledAlerts) {
            if (matchesAlert(opportunity, alert)) {
                matches.add(new AlertMatch(
                    alert.getUser().getId(),
                    alert.getId(),
                    alert.getName()
                ));
            }
        }

        return matches;
    }

    /**
     * Check if an opportunity matches an alert's criteria.
     */
    public boolean matchesAlert(Opportunity opportunity, OpportunityAlert alert) {
        // Check NAICS codes
        if (alert.getNaicsCodes() != null && !alert.getNaicsCodes().isEmpty()) {
            if (opportunity.getNaicsCode() == null) {
                return false;
            }
            boolean naicsMatch = alert.getNaicsCodes().stream()
                .anyMatch(naics -> opportunity.getNaicsCode().startsWith(naics));
            if (!naicsMatch) {
                return false;
            }
        }

        // Check keywords in title and description
        if (alert.getKeywords() != null && !alert.getKeywords().isEmpty()) {
            boolean keywordMatch = alert.getKeywords().stream()
                .anyMatch(keyword -> matchesKeyword(opportunity, keyword));
            if (!keywordMatch) {
                return false;
            }
        }

        // Check value range
        BigDecimal opportunityValue = getOpportunityValue(opportunity);
        if (opportunityValue != null) {
            if (alert.getMinValue() != null && opportunityValue.compareTo(alert.getMinValue()) < 0) {
                return false;
            }
            if (alert.getMaxValue() != null && opportunityValue.compareTo(alert.getMaxValue()) > 0) {
                return false;
            }
        } else {
            // If opportunity has no value but alert has value constraints, don't match
            if (alert.getMinValue() != null || alert.getMaxValue() != null) {
                return false;
            }
        }

        return true;
    }

    private boolean matchesKeyword(Opportunity opportunity, String keyword) {
        String lowerKeyword = keyword.toLowerCase();

        if (opportunity.getTitle() != null &&
            opportunity.getTitle().toLowerCase().contains(lowerKeyword)) {
            return true;
        }

        if (opportunity.getDescription() != null &&
            opportunity.getDescription().toLowerCase().contains(lowerKeyword)) {
            return true;
        }

        return false;
    }

    private BigDecimal getOpportunityValue(Opportunity opportunity) {
        if (opportunity.getAwardAmount() != null) {
            return opportunity.getAwardAmount();
        }
        if (opportunity.getEstimatedValueHigh() != null) {
            return opportunity.getEstimatedValueHigh();
        }
        if (opportunity.getEstimatedValueLow() != null) {
            return opportunity.getEstimatedValueLow();
        }
        return null;
    }

    private UUID requireCurrentUserId() {
        UUID userId = TenantContext.getCurrentUserId();
        if (userId == null) {
            throw new ForbiddenException("No authenticated user");
        }
        return userId;
    }

    // DTOs and Records

    public record CreateOpportunityAlertRequest(
        String name,
        String description,
        List<String> naicsCodes,
        List<String> keywords,
        BigDecimal minValue,
        BigDecimal maxValue,
        Boolean enabled
    ) {}

    public record UpdateOpportunityAlertRequest(
        String name,
        String description,
        List<String> naicsCodes,
        List<String> keywords,
        BigDecimal minValue,
        BigDecimal maxValue,
        Boolean enabled
    ) {}

    public record OpportunityAlertDto(
        UUID id,
        String name,
        String description,
        List<String> naicsCodes,
        List<String> keywords,
        BigDecimal minValue,
        BigDecimal maxValue,
        Boolean enabled,
        Instant lastCheckedAt,
        Integer lastMatchCount,
        Instant createdAt,
        Instant updatedAt
    ) {
        public static OpportunityAlertDto fromEntity(OpportunityAlert entity) {
            return new OpportunityAlertDto(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getNaicsCodes() != null ? new ArrayList<>(entity.getNaicsCodes()) : new ArrayList<>(),
                entity.getKeywords() != null ? new ArrayList<>(entity.getKeywords()) : new ArrayList<>(),
                entity.getMinValue(),
                entity.getMaxValue(),
                entity.getEnabled(),
                entity.getLastCheckedAt(),
                entity.getLastMatchCount(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            );
        }
    }

    public record AlertMatch(
        UUID userId,
        UUID alertId,
        String alertName
    ) {}
}
