package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.FeatureRequest.FeatureRequestStatus;
import com.samgov.ingestor.service.FeatureRequestService;
import com.samgov.ingestor.service.FeatureRequestService.CreateFeatureRequestRequest;
import com.samgov.ingestor.service.FeatureRequestService.FeatureRequestDto;
import com.samgov.ingestor.service.FeatureRequestService.UpdateAdminFieldsRequest;
import com.samgov.ingestor.service.FeatureRequestService.UpdateFeatureRequestRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/portal/feature-requests")
@RequiredArgsConstructor
public class FeatureRequestController {

    private final FeatureRequestService featureRequestService;

    /**
     * Get all feature requests with optional filtering and sorting.
     */
    @GetMapping
    public ResponseEntity<Page<FeatureRequestDto>> getFeatureRequests(
            @RequestParam(required = false) FeatureRequestStatus status,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FeatureRequestDto> requests = featureRequestService.getFeatureRequests(status, sortBy, pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get the top voted feature requests.
     */
    @GetMapping("/top")
    public ResponseEntity<List<FeatureRequestDto>> getTopVoted(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<FeatureRequestDto> requests = featureRequestService.getTopVoted(limit);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get feature requests created by the current user.
     */
    @GetMapping("/mine")
    public ResponseEntity<Page<FeatureRequestDto>> getMyFeatureRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FeatureRequestDto> requests = featureRequestService.getMyFeatureRequests(pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get feature requests that the current user has voted for.
     */
    @GetMapping("/voted")
    public ResponseEntity<Page<FeatureRequestDto>> getMyVotedRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FeatureRequestDto> requests = featureRequestService.getMyVotedRequests(pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * Search feature requests by keyword.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<FeatureRequestDto>> searchFeatureRequests(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FeatureRequestDto> requests = featureRequestService.searchFeatureRequests(keyword, pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get a single feature request by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FeatureRequestDto> getFeatureRequest(@PathVariable UUID id) {
        FeatureRequestDto request = featureRequestService.getFeatureRequest(id);
        return ResponseEntity.ok(request);
    }

    /**
     * Submit a new feature request.
     */
    @PostMapping
    public ResponseEntity<FeatureRequestDto> createFeatureRequest(
            @Valid @RequestBody CreateFeatureRequestRequest request
    ) {
        log.info("Creating feature request: {}", request.title());
        FeatureRequestDto created = featureRequestService.createFeatureRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update a feature request.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FeatureRequestDto> updateFeatureRequest(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateFeatureRequestRequest request
    ) {
        FeatureRequestDto updated = featureRequestService.updateFeatureRequest(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update feature request status (admin only).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("@tenantSecurityService.hasPermission('ADMIN')")
    public ResponseEntity<FeatureRequestDto> updateStatus(
            @PathVariable UUID id,
            @RequestParam FeatureRequestStatus status
    ) {
        log.info("Updating feature request {} status to {}", id, status);
        FeatureRequestDto updated = featureRequestService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update admin-only fields (admin only).
     */
    @PutMapping("/{id}/admin")
    @PreAuthorize("@tenantSecurityService.hasPermission('ADMIN')")
    public ResponseEntity<FeatureRequestDto> updateAdminFields(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAdminFieldsRequest request
    ) {
        FeatureRequestDto updated = featureRequestService.updateAdminFields(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a feature request.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeatureRequest(@PathVariable UUID id) {
        log.info("Deleting feature request: {}", id);
        featureRequestService.deleteFeatureRequest(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Vote for a feature request.
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<FeatureRequestDto> vote(@PathVariable UUID id) {
        FeatureRequestDto updated = featureRequestService.vote(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Remove vote from a feature request.
     */
    @DeleteMapping("/{id}/vote")
    public ResponseEntity<FeatureRequestDto> unvote(@PathVariable UUID id) {
        FeatureRequestDto updated = featureRequestService.unvote(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Check if the current user has voted for a feature request.
     */
    @GetMapping("/{id}/voted")
    public ResponseEntity<Map<String, Boolean>> hasVoted(@PathVariable UUID id) {
        boolean voted = featureRequestService.hasVoted(id);
        return ResponseEntity.ok(Map.of("voted", voted));
    }
}
