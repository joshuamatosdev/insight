package com.samgov.ingestor.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interactions", indexes = {
    @Index(name = "idx_interaction_tenant", columnList = "tenant_id"),
    @Index(name = "idx_interaction_contact", columnList = "contact_id"),
    @Index(name = "idx_interaction_organization", columnList = "organization_id"),
    @Index(name = "idx_interaction_type", columnList = "interaction_type"),
    @Index(name = "idx_interaction_date", columnList = "interaction_date")
})
public class Interaction {

    public enum InteractionType {
        PHONE_CALL,
        EMAIL,
        MEETING_IN_PERSON,
        MEETING_VIRTUAL,
        CONFERENCE,
        TRADE_SHOW,
        INDUSTRY_DAY,
        SITE_VISIT,
        PRESENTATION,
        PROPOSAL_SUBMISSION,
        DEBRIEF,
        NETWORKING_EVENT,
        LINKEDIN_MESSAGE,
        NOTE,
        OTHER
    }

    public enum InteractionOutcome {
        POSITIVE,
        NEUTRAL,
        NEGATIVE,
        FOLLOW_UP_REQUIRED,
        NO_ANSWER,
        LEFT_MESSAGE,
        MEETING_SCHEDULED,
        REFERRAL_RECEIVED,
        INFORMATION_GATHERED,
        RELATIONSHIP_STRENGTHENED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(name = "interaction_type", nullable = false)
    private InteractionType interactionType;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "interaction_date", nullable = false)
    private LocalDateTime interactionDate;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    private InteractionOutcome outcome;

    @Column(name = "outcome_notes", length = 1000)
    private String outcomeNotes;

    // Location
    @Column
    private String location;

    @Column(name = "location_type")
    private String locationType;

    // Attendees
    @Column(name = "attendees", columnDefinition = "TEXT")
    private String attendees;

    @Column(name = "internal_attendees", columnDefinition = "TEXT")
    private String internalAttendees;

    // Follow-up
    @Column(name = "follow_up_required", nullable = false)
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "follow_up_notes", length = 1000)
    private String followUpNotes;

    @Column(name = "follow_up_completed", nullable = false)
    private Boolean followUpCompleted = false;

    // Related documents
    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls;

    // Meeting link
    @Column(name = "meeting_link")
    private String meetingLink;

    // Tags
    @Column(columnDefinition = "TEXT")
    private String tags;

    // Logged by
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logged_by", nullable = false)
    private User loggedBy;

    // Audit fields
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

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public Opportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(Opportunity opportunity) {
        this.opportunity = opportunity;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public InteractionType getInteractionType() {
        return interactionType;
    }

    public void setInteractionType(InteractionType interactionType) {
        this.interactionType = interactionType;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getInteractionDate() {
        return interactionDate;
    }

    public void setInteractionDate(LocalDateTime interactionDate) {
        this.interactionDate = interactionDate;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public InteractionOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(InteractionOutcome outcome) {
        this.outcome = outcome;
    }

    public String getOutcomeNotes() {
        return outcomeNotes;
    }

    public void setOutcomeNotes(String outcomeNotes) {
        this.outcomeNotes = outcomeNotes;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLocationType() {
        return locationType;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public String getAttendees() {
        return attendees;
    }

    public void setAttendees(String attendees) {
        this.attendees = attendees;
    }

    public String getInternalAttendees() {
        return internalAttendees;
    }

    public void setInternalAttendees(String internalAttendees) {
        this.internalAttendees = internalAttendees;
    }

    public Boolean getFollowUpRequired() {
        return followUpRequired;
    }

    public void setFollowUpRequired(Boolean followUpRequired) {
        this.followUpRequired = followUpRequired;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getFollowUpNotes() {
        return followUpNotes;
    }

    public void setFollowUpNotes(String followUpNotes) {
        this.followUpNotes = followUpNotes;
    }

    public Boolean getFollowUpCompleted() {
        return followUpCompleted;
    }

    public void setFollowUpCompleted(Boolean followUpCompleted) {
        this.followUpCompleted = followUpCompleted;
    }

    public String getAttachmentUrls() {
        return attachmentUrls;
    }

    public void setAttachmentUrls(String attachmentUrls) {
        this.attachmentUrls = attachmentUrls;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public User getLoggedBy() {
        return loggedBy;
    }

    public void setLoggedBy(User loggedBy) {
        this.loggedBy = loggedBy;
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
