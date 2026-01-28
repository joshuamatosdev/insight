package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.OpportunityAlertService;
import com.samgov.ingestor.service.OpportunityAlertService.CreateOpportunityAlertRequest;
import com.samgov.ingestor.service.OpportunityAlertService.OpportunityAlertDto;
import com.samgov.ingestor.service.OpportunityAlertService.UpdateOpportunityAlertRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/opportunity-alerts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OpportunityAlertController {

    private final OpportunityAlertService opportunityAlertService;

    /**
     * List all opportunity alerts for the current user.
     * GET /api/v1/opportunity-alerts
     */
    @GetMapping
    public ResponseEntity<Page<OpportunityAlertDto>> listAlerts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OpportunityAlertDto> alerts = opportunityAlertService.getMyAlerts(pageable);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get a specific opportunity alert by ID.
     * GET /api/v1/opportunity-alerts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<OpportunityAlertDto> getAlert(@PathVariable UUID id) {
        OpportunityAlertDto alert = opportunityAlertService.getAlert(id);
        return ResponseEntity.ok(alert);
    }

    /**
     * Create a new opportunity alert.
     * POST /api/v1/opportunity-alerts
     */
    @PostMapping
    public ResponseEntity<OpportunityAlertDto> createAlert(
        @Valid @RequestBody CreateOpportunityAlertRequest request
    ) {
        OpportunityAlertDto alert = opportunityAlertService.createAlert(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(alert);
    }

    /**
     * Update an existing opportunity alert.
     * PUT /api/v1/opportunity-alerts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<OpportunityAlertDto> updateAlert(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateOpportunityAlertRequest request
    ) {
        OpportunityAlertDto alert = opportunityAlertService.updateAlert(id, request);
        return ResponseEntity.ok(alert);
    }

    /**
     * Delete an opportunity alert.
     * DELETE /api/v1/opportunity-alerts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable UUID id) {
        opportunityAlertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle the enabled status of an alert.
     * POST /api/v1/opportunity-alerts/{id}/toggle
     */
    @PostMapping("/{id}/toggle")
    public ResponseEntity<OpportunityAlertDto> toggleAlert(@PathVariable UUID id) {
        OpportunityAlertDto alert = opportunityAlertService.toggleAlert(id);
        return ResponseEntity.ok(alert);
    }
}
