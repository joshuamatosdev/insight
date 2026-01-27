package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.FeatureRequest;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestCategory;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestPriority;
import com.samgov.ingestor.model.FeatureRequest.FeatureRequestStatus;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.FeatureRequestRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeatureRequestService {

    private final FeatureRequestRepository featureRequestRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Get feature requests with optional status filter and sorting.
     */
    public Page<FeatureRequestDto> getFeatureRequests(
            FeatureRequestStatus status,
            String sortBy,
            Pageable pageable
    ) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        Sort sort = createSort(sortBy);
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );

        Page<FeatureRequest> requests;
        if (status != null) {
            requests = featureRequestRepository.findByTenantIdAndStatus(tenantId, status, sortedPageable);
        } else {
            requests = featureRequestRepository.findByTenantId(tenantId, sortedPageable);
        }

        return requests.map(this::toDto);
    }

    /**
     * Get a single feature request by ID.
     */
    public FeatureRequestDto getFeatureRequest(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        FeatureRequest request = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));
        return toDto(request);
    }

    /**
     * Create a new feature request.
     */
    @Transactional
    public FeatureRequestDto createFeatureRequest(CreateFeatureRequestRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant", tenantId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        FeatureRequest featureRequest = FeatureRequest.builder()
                .tenant(tenant)
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .status(FeatureRequestStatus.SUBMITTED)
                .submittedBy(user)
                .build();

        FeatureRequest saved = featureRequestRepository.save(featureRequest);

        auditService.logAction(
                AuditAction.FEATURE_REQUEST_CREATED,
                "FeatureRequest",
                saved.getId().toString(),
                "Created feature request: " + saved.getTitle()
        );

        log.info("Feature request created: {} by user {}", saved.getId(), userId);

        return toDto(saved);
    }

    /**
     * Update an existing feature request.
     */
    @Transactional
    public FeatureRequestDto updateFeatureRequest(UUID id, UpdateFeatureRequestRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        FeatureRequest featureRequest = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));

        // Only the creator can update their own request (unless admin)
        if (!featureRequest.getSubmittedBy().getId().equals(userId)) {
            throw new IllegalStateException("Only the creator can update this feature request");
        }

        if (request.title() != null) {
            featureRequest.setTitle(request.title());
        }
        if (request.description() != null) {
            featureRequest.setDescription(request.description());
        }
        if (request.category() != null) {
            featureRequest.setCategory(request.category());
        }

        FeatureRequest saved = featureRequestRepository.save(featureRequest);

        auditService.logAction(
                AuditAction.FEATURE_REQUEST_UPDATED,
                "FeatureRequest",
                saved.getId().toString(),
                "Updated feature request: " + saved.getTitle()
        );

        return toDto(saved);
    }

    /**
     * Update the status of a feature request (admin only).
     */
    @Transactional
    public FeatureRequestDto updateStatus(UUID id, FeatureRequestStatus status) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        FeatureRequest featureRequest = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));

        FeatureRequestStatus oldStatus = featureRequest.getStatus();
        featureRequest.setStatus(status);

        if (status == FeatureRequestStatus.COMPLETED) {
            featureRequest.setCompletedAt(Instant.now());
        }

        FeatureRequest saved = featureRequestRepository.save(featureRequest);

        auditService.logAction(
                AuditAction.FEATURE_REQUEST_STATUS_CHANGED,
                "FeatureRequest",
                saved.getId().toString(),
                "Status changed from " + oldStatus + " to " + status
        );

        log.info("Feature request {} status changed from {} to {}", id, oldStatus, status);

        return toDto(saved);
    }

    /**
     * Update admin notes and other admin-only fields.
     */
    @Transactional
    public FeatureRequestDto updateAdminFields(UUID id, UpdateAdminFieldsRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        FeatureRequest featureRequest = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));

        if (request.adminNotes() != null) {
            featureRequest.setAdminNotes(request.adminNotes());
        }
        if (request.targetRelease() != null) {
            featureRequest.setTargetRelease(request.targetRelease());
        }
        if (request.priority() != null) {
            featureRequest.setPriority(request.priority());
        }

        FeatureRequest saved = featureRequestRepository.save(featureRequest);

        auditService.logAction(
                AuditAction.FEATURE_REQUEST_UPDATED,
                "FeatureRequest",
                saved.getId().toString(),
                "Updated admin fields for feature request"
        );

        return toDto(saved);
    }

    /**
     * Delete a feature request.
     */
    @Transactional
    public void deleteFeatureRequest(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        FeatureRequest featureRequest = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));

        // Only the creator can delete their own request (unless admin)
        if (!featureRequest.getSubmittedBy().getId().equals(userId)) {
            throw new IllegalStateException("Only the creator can delete this feature request");
        }

        String title = featureRequest.getTitle();
        featureRequestRepository.delete(featureRequest);

        auditService.logAction(
                AuditAction.FEATURE_REQUEST_DELETED,
                "FeatureRequest",
                id.toString(),
                "Deleted feature request: " + title
        );

        log.info("Feature request deleted: {} by user {}", id, userId);
    }

    /**
     * Add a vote to a feature request.
     */
    @Transactional
    public FeatureRequestDto vote(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        FeatureRequest featureRequest = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (featureRequest.hasVoted(user)) {
            throw new IllegalStateException("User has already voted for this feature request");
        }

        featureRequest.addVote(user);
        FeatureRequest saved = featureRequestRepository.save(featureRequest);

        log.debug("User {} voted for feature request {}", userId, id);

        return toDto(saved);
    }

    /**
     * Remove a vote from a feature request.
     */
    @Transactional
    public FeatureRequestDto unvote(UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        FeatureRequest featureRequest = featureRequestRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResourceNotFoundException("FeatureRequest", id));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!featureRequest.hasVoted(user)) {
            throw new IllegalStateException("User has not voted for this feature request");
        }

        featureRequest.removeVote(user);
        FeatureRequest saved = featureRequestRepository.save(featureRequest);

        log.debug("User {} removed vote from feature request {}", userId, id);

        return toDto(saved);
    }

    /**
     * Check if the current user has voted for a feature request.
     */
    public boolean hasVoted(UUID id) {
        UUID userId = TenantContext.getCurrentUserId();
        return featureRequestRepository.hasUserVoted(id, userId);
    }

    /**
     * Get the top voted feature requests.
     */
    public List<FeatureRequestDto> getTopVoted(int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pageable pageable = PageRequest.of(0, limit);
        return featureRequestRepository.findTopVotedByTenantId(tenantId, pageable)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Search feature requests by keyword.
     */
    public Page<FeatureRequestDto> searchFeatureRequests(String keyword, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return featureRequestRepository.searchByKeyword(tenantId, keyword, pageable)
                .map(this::toDto);
    }

    /**
     * Get feature requests created by the current user.
     */
    public Page<FeatureRequestDto> getMyFeatureRequests(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        return featureRequestRepository.findByTenantIdAndSubmittedById(tenantId, userId, pageable)
                .map(this::toDto);
    }

    /**
     * Get feature requests that the current user has voted for.
     */
    public Page<FeatureRequestDto> getMyVotedRequests(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();
        return featureRequestRepository.findVotedByUser(tenantId, userId, pageable)
                .map(this::toDto);
    }

    private Sort createSort(String sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sortBy.toLowerCase()) {
            case "votes", "votecount" -> Sort.by(Sort.Direction.DESC, "voteCount");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "newest", "date", "createdat" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "title" -> Sort.by(Sort.Direction.ASC, "title");
            case "status" -> Sort.by(Sort.Direction.ASC, "status");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private FeatureRequestDto toDto(FeatureRequest fr) {
        UUID currentUserId = TenantContext.getCurrentUserId();
        boolean hasVoted = currentUserId != null && fr.getVoters().stream()
                .anyMatch(v -> v.getId().equals(currentUserId));

        return new FeatureRequestDto(
                fr.getId(),
                fr.getTitle(),
                fr.getDescription(),
                fr.getStatus(),
                fr.getCategory(),
                fr.getPriority(),
                fr.getVoteCount(),
                hasVoted,
                fr.getSubmittedBy().getId(),
                fr.getSubmittedBy().getFullName(),
                fr.getAdminNotes(),
                fr.getTargetRelease(),
                fr.getCompletedAt(),
                fr.getCreatedAt(),
                fr.getUpdatedAt()
        );
    }

    // Request/Response DTOs

    public record CreateFeatureRequestRequest(
            String title,
            String description,
            FeatureRequestCategory category
    ) {}

    public record UpdateFeatureRequestRequest(
            String title,
            String description,
            FeatureRequestCategory category
    ) {}

    public record UpdateAdminFieldsRequest(
            String adminNotes,
            String targetRelease,
            FeatureRequestPriority priority
    ) {}

    public record FeatureRequestDto(
            UUID id,
            String title,
            String description,
            FeatureRequestStatus status,
            FeatureRequestCategory category,
            FeatureRequestPriority priority,
            Integer voteCount,
            Boolean hasVoted,
            UUID submittedById,
            String submittedByName,
            String adminNotes,
            String targetRelease,
            Instant completedAt,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
