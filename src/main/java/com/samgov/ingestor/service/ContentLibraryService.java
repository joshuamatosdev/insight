package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.ContentLibraryItem.ContentType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class ContentLibraryService {

    private final ContentLibraryItemRepository contentRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ContentLibraryService(ContentLibraryItemRepository contentRepository,
                                  TenantRepository tenantRepository, UserRepository userRepository,
                                  AuditService auditService) {
        this.contentRepository = contentRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public record CreateContentRequest(String title, String description, ContentType contentType, String content,
                                        String tags, String keywords, String category, String subCategory,
                                        String naicsCodes, String pscCodes) {}

    public record ContentResponse(UUID id, String title, String description, ContentType contentType, String content,
                                   List<String> tags, List<String> keywords, String category, String subCategory,
                                   Integer usageCount, Instant lastUsedAt, Integer wordCount, Integer qualityScore,
                                   String createdByName, Instant createdAt, Instant updatedAt) {}

    public ContentResponse createContent(UUID tenantId, UUID userId, CreateContentRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ContentLibraryItem content = new ContentLibraryItem();
        content.setTenant(tenant);
        content.setCreatedBy(user);
        content.setTitle(request.title());
        content.setDescription(request.description());
        content.setContentType(request.contentType());
        content.setContent(request.content());
        content.setTags(request.tags());
        content.setKeywords(request.keywords());
        content.setCategory(request.category());
        content.setSubCategory(request.subCategory());
        content.setNaicsCodes(request.naicsCodes());
        content.setPscCodes(request.pscCodes());

        content = contentRepository.save(content);
        auditService.logAction(AuditAction.CONTENT_CREATED, "ContentLibraryItem", content.getId().toString(),
                "Created content: " + request.title());

        return toResponse(content);
    }

    @Transactional(readOnly = true)
    public Page<ContentResponse> getContents(UUID tenantId, Pageable pageable) {
        return contentRepository.findByTenantIdAndIsActiveTrueAndIsLatestVersionTrue(tenantId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContentResponse> getContentsByType(UUID tenantId, ContentType type, Pageable pageable) {
        return contentRepository.findByTenantIdAndContentTypeAndIsActiveTrueAndIsLatestVersionTrue(tenantId, type, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContentResponse> getContentsByCategory(UUID tenantId, String category, Pageable pageable) {
        return contentRepository.findByTenantIdAndCategoryAndIsActiveTrueAndIsLatestVersionTrue(tenantId, category, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContentResponse> searchContents(UUID tenantId, String search, Pageable pageable) {
        return contentRepository.searchContent(tenantId, search, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<ContentResponse> getContent(UUID contentId) {
        return contentRepository.findById(contentId).map(this::toResponse);
    }

    public ContentResponse updateContent(UUID tenantId, UUID contentId, UUID userId, CreateContentRequest request) {
        ContentLibraryItem content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found"));

        if (!content.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Content does not belong to tenant");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        content.setUpdatedBy(user);
        content.setTitle(request.title());
        content.setDescription(request.description());
        content.setContentType(request.contentType());
        content.setContent(request.content());
        content.setTags(request.tags());
        content.setKeywords(request.keywords());
        content.setCategory(request.category());
        content.setSubCategory(request.subCategory());
        content.setNaicsCodes(request.naicsCodes());
        content.setPscCodes(request.pscCodes());

        content = contentRepository.save(content);
        auditService.logAction(AuditAction.CONTENT_UPDATED, "ContentLibraryItem", contentId.toString(), "Updated content");

        return toResponse(content);
    }

    public void recordUsage(UUID contentId, String proposalName) {
        contentRepository.findById(contentId).ifPresent(content -> {
            content.recordUsage(proposalName);
            contentRepository.save(content);
        });
    }

    public void recordUsage(UUID contentId) {
        recordUsage(contentId, null);
    }

    public void deleteContent(UUID tenantId, UUID contentId, UUID userId) {
        ContentLibraryItem content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("Content not found"));

        if (!content.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Content does not belong to tenant");
        }

        contentRepository.delete(content);
        auditService.logAction(AuditAction.CONTENT_DELETED, "ContentLibraryItem", contentId.toString(),
                "Deleted content: " + content.getTitle());
    }

    @Transactional(readOnly = true)
    public List<ContentResponse> getMostUsedContents(UUID tenantId, int limit) {
        return contentRepository.findMostUsed(tenantId, Pageable.ofSize(limit))
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<ContentResponse> getContentsByTag(UUID tenantId, String tag, Pageable pageable) {
        // Search in tags field
        return contentRepository.searchContent(tenantId, tag, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContentResponse> getTemplates(UUID tenantId, Pageable pageable) {
        // Templates are ContentType.TEMPLATE or similar - return all content for now
        return contentRepository.findByTenantIdAndIsActiveTrueAndIsLatestVersionTrue(tenantId, pageable)
                .map(this::toResponse);
    }

    private ContentResponse toResponse(ContentLibraryItem content) {
        List<String> tags = content.getTags() != null ?
                Arrays.asList(content.getTags().split(",")) : Collections.emptyList();
        List<String> keywords = content.getKeywords() != null ?
                Arrays.asList(content.getKeywords().split(",")) : Collections.emptyList();

        String createdByName = content.getCreatedBy() != null ?
                content.getCreatedBy().getFirstName() + " " + content.getCreatedBy().getLastName() : "Unknown";

        return new ContentResponse(content.getId(), content.getTitle(), content.getDescription(),
                content.getContentType(), content.getContent(), tags, keywords, content.getCategory(),
                content.getSubCategory(), content.getUsageCount(), content.getLastUsedAt(),
                content.getWordCount(), content.getQualityScore(), createdByName,
                content.getCreatedAt(), content.getUpdatedAt());
    }
}
