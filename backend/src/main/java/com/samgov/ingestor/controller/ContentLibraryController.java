package com.samgov.ingestor.controller;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.model.ContentLibraryItem.ContentType;
import com.samgov.ingestor.service.ContentLibraryService;
import com.samgov.ingestor.service.ContentLibraryService.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/content-library")
@PreAuthorize("isAuthenticated()")
public class ContentLibraryController {

    private final ContentLibraryService contentLibraryService;

    public ContentLibraryController(ContentLibraryService contentLibraryService) {
        this.contentLibraryService = contentLibraryService;
    }

    @PostMapping
    public ResponseEntity<ContentResponse> createContent(
            @Valid @RequestBody CreateContentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(contentLibraryService.createContent(tenantId, userId, request));
    }

    @GetMapping
    public ResponseEntity<Page<ContentResponse>> getContents(
            @RequestParam(required = false) ContentType type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag,
            Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(contentLibraryService.searchContents(tenantId, search, pageable));
        }
        if (tag != null && !tag.isEmpty()) {
            return ResponseEntity.ok(contentLibraryService.getContentsByTag(tenantId, tag, pageable));
        }
        if (type != null) {
            return ResponseEntity.ok(contentLibraryService.getContentsByType(tenantId, type, pageable));
        }
        return ResponseEntity.ok(contentLibraryService.getContents(tenantId, pageable));
    }

    @GetMapping("/templates")
    public ResponseEntity<Page<ContentResponse>> getTemplates(Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(contentLibraryService.getTemplates(tenantId, pageable));
    }

    @GetMapping("/most-used")
    public ResponseEntity<List<ContentResponse>> getMostUsed(
            @RequestParam(defaultValue = "10") int limit) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return ResponseEntity.ok(contentLibraryService.getMostUsedContents(tenantId, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentResponse> getContent(@PathVariable UUID id) {
        return contentLibraryService.getContent(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentResponse> updateContent(
            @PathVariable UUID id,
            @Valid @RequestBody CreateContentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(contentLibraryService.updateContent(tenantId, id, userId, request));
    }

    @PostMapping("/{id}/use")
    public ResponseEntity<Void> recordUsage(@PathVariable UUID id) {
        contentLibraryService.recordUsage(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = UUID.fromString(userDetails.getUsername());
        contentLibraryService.deleteContent(tenantId, id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/types")
    public ResponseEntity<List<ContentType>> getContentTypes() {
        return ResponseEntity.ok(Arrays.asList(ContentType.values()));
    }
}
