package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.SavedOpportunityService;
import com.samgov.ingestor.service.SavedOpportunityService.SavedOpportunityDto;
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

import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/v1/saved-opportunities")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SavedOpportunityController {

    private final SavedOpportunityService savedOpportunityService;

    @PostMapping
    public ResponseEntity<SavedOpportunityDto> saveOpportunity(
        @Valid @RequestBody SaveOpportunityRequest request
    ) {
        log.info("Saving opportunity: {}", request.opportunityId());
        SavedOpportunityDto saved = savedOpportunityService.saveOpportunity(
            request.opportunityId(),
            request.notes(),
            request.tags()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{opportunityId}")
    public ResponseEntity<Void> unsaveOpportunity(@PathVariable String opportunityId) {
        log.info("Unsaving opportunity: {}", opportunityId);
        savedOpportunityService.unsaveOpportunity(opportunityId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{opportunityId}")
    public ResponseEntity<SavedOpportunityDto> updateNotes(
        @PathVariable String opportunityId,
        @Valid @RequestBody UpdateNotesRequest request
    ) {
        SavedOpportunityDto saved = savedOpportunityService.updateNotes(
            opportunityId,
            request.notes(),
            request.tags()
        );
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<Page<SavedOpportunityDto>> getMySavedOpportunities(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SavedOpportunityDto> saved = savedOpportunityService.getMySavedOpportunities(pageable);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/check/{opportunityId}")
    public ResponseEntity<SavedStatusResponse> checkIfSaved(@PathVariable String opportunityId) {
        boolean isSaved = savedOpportunityService.isOpportunitySaved(opportunityId);
        return ResponseEntity.ok(new SavedStatusResponse(isSaved));
    }

    @GetMapping("/ids")
    public ResponseEntity<Set<String>> getSavedOpportunityIds() {
        Set<String> ids = savedOpportunityService.getSavedOpportunityIds();
        return ResponseEntity.ok(ids);
    }

    @GetMapping("/count")
    public ResponseEntity<SavedCountResponse> getSavedCount() {
        long count = savedOpportunityService.getSavedCount();
        return ResponseEntity.ok(new SavedCountResponse(count));
    }

    public record SaveOpportunityRequest(
        String opportunityId,
        String notes,
        String tags
    ) {}

    public record UpdateNotesRequest(
        String notes,
        String tags
    ) {}

    public record SavedStatusResponse(boolean isSaved) {}

    public record SavedCountResponse(long count) {}
}
