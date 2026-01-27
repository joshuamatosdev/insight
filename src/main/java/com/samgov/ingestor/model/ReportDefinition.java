package com.samgov.ingestor.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity for custom report definitions with drag-and-drop column configuration.
 * Allows users to create reusable report templates with specific columns, filters, and sorting.
 */
@Entity
@Table(name = "report_definitions", indexes = {
    @Index(name = "idx_report_def_tenant", columnList = "tenant_id"),
    @Index(name = "idx_report_def_user", columnList = "user_id"),
    @Index(name = "idx_report_def_entity_type", columnList = "entity_type"),
    @Index(name = "idx_report_def_public", columnList = "is_public")
})
public class ReportDefinition {

    /**
     * Entity types that can be reported on
     */
    public enum EntityType {
        OPPORTUNITY,
        CONTRACT,
        PIPELINE,
        INVOICE,
        CONTACT,
        ORGANIZATION,
        CERTIFICATION,
        COMPLIANCE,
        DELIVERABLE,
        BUDGET
    }

    /**
     * Sort direction for report data
     */
    public enum SortDirection {
        ASC,
        DESC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    /**
     * JSON array of column definitions.
     * Example: [{"field": "title", "label": "Title", "width": 200, "visible": true}, ...]
     */
    @Column(name = "columns", columnDefinition = "TEXT", nullable = false)
    private String columns;

    /**
     * JSON array of filter conditions.
     * Example: [{"field": "status", "operator": "EQUALS", "value": "ACTIVE"}, ...]
     */
    @Column(name = "filters", columnDefinition = "TEXT")
    private String filters;

    /**
     * Field name to sort by
     */
    @Column(name = "sort_by", length = 100)
    private String sortBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "sort_direction")
    private SortDirection sortDirection;

    /**
     * Whether this report is shared with all tenant users
     */
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    /**
     * Number of times this report has been executed
     */
    @Column(name = "run_count", nullable = false)
    private Integer runCount = 0;

    @Column(name = "last_run_at")
    private Instant lastRunAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Record that the report was executed
     */
    public void recordExecution() {
        this.runCount++;
        this.lastRunAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }

    public String getColumns() {
        return columns;
    }

    public void setColumns(String columns) {
        this.columns = columns;
    }

    public String getFilters() {
        return filters;
    }

    public void setFilters(String filters) {
        this.filters = filters;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public SortDirection getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(SortDirection sortDirection) {
        this.sortDirection = sortDirection;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Integer getRunCount() {
        return runCount;
    }

    public void setRunCount(Integer runCount) {
        this.runCount = runCount;
    }

    public Instant getLastRunAt() {
        return lastRunAt;
    }

    public void setLastRunAt(Instant lastRunAt) {
        this.lastRunAt = lastRunAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
