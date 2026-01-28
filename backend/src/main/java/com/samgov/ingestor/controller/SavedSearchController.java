package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.SavedSearchService;
import com.samgov.ingestor.service.SavedSearchService.CreateSavedSearchRequest;
import com.samgov.ingestor.service.SavedSearchService.SavedSearchDto;
import com.samgov.ingestor.service.SavedSearchService.UpdateSavedSearchRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/saved-searches")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class SavedSearchController {

    private final SavedSearchService savedSearchService;

    @PostMapping
    public ResponseEntity<SavedSearchDto> createSavedSearch(
        @Valid @RequestBody CreateSavedSearchRequest request
    ) {
        log.info("Creating saved search: {}", request.name());
        SavedSearchDto savedSearch = savedSearchService.createSavedSearch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSearch);
    }

    @GetMapping
    public ResponseEntity<List<SavedSearchDto>> getMySavedSearches() {
        List<SavedSearchDto> searches = savedSearchService.getUserSavedSearches();
        return ResponseEntity.ok(searches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SavedSearchDto> getSavedSearch(@PathVariable UUID id) {
        return savedSearchService.getSavedSearchById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavedSearchDto> updateSavedSearch(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateSavedSearchRequest request
    ) {
        log.info("Updating saved search: {}", id);
        SavedSearchDto savedSearch = savedSearchService.updateSavedSearch(id, request);
        return ResponseEntity.ok(savedSearch);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavedSearch(@PathVariable UUID id) {
        log.info("Deleting saved search: {}", id);
        savedSearchService.deleteSavedSearch(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/set-default")
    public ResponseEntity<Void> setAsDefault(@PathVariable UUID id) {
        log.info("Setting saved search as default: {}", id);
        savedSearchService.setAsDefault(id);
        return ResponseEntity.noContent().build();
    }
}
