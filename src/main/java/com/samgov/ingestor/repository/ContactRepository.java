package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Contact;
import com.samgov.ingestor.model.Contact.ContactStatus;
import com.samgov.ingestor.model.Contact.ContactType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID>, JpaSpecificationExecutor<Contact> {

    Page<Contact> findByTenantIdAndStatusNot(UUID tenantId, ContactStatus status, Pageable pageable);

    Optional<Contact> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Contact> findByTenantIdAndEmail(UUID tenantId, String email);

    boolean existsByTenantIdAndEmail(UUID tenantId, String email);

    // By organization
    List<Contact> findByOrganizationIdAndStatusNot(UUID organizationId, ContactStatus status);

    Page<Contact> findByOrganizationIdAndStatusNot(UUID organizationId, ContactStatus status, Pageable pageable);

    // By type
    Page<Contact> findByTenantIdAndContactTypeAndStatusNot(
        UUID tenantId,
        ContactType contactType,
        ContactStatus status,
        Pageable pageable
    );

    List<Contact> findByTenantIdAndContactTypeAndStatusNot(
        UUID tenantId,
        ContactType contactType,
        ContactStatus status
    );

    // By owner
    Page<Contact> findByOwnerIdAndStatusNot(UUID ownerId, ContactStatus status, Pageable pageable);

    // Search
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status <> 'ARCHIVED'
        AND (LOWER(c.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.jobTitle) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(c.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Contact> searchContacts(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // Followup needed
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.nextFollowupDate IS NOT NULL
        AND c.nextFollowupDate <= :date
        ORDER BY c.nextFollowupDate ASC
        """)
    List<Contact> findContactsNeedingFollowup(
        @Param("tenantId") UUID tenantId,
        @Param("date") LocalDate date
    );

    // Recently contacted
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.lastContactDate IS NOT NULL
        ORDER BY c.lastContactDate DESC
        """)
    Page<Contact> findRecentlyContacted(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Not contacted recently
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND (c.lastContactDate IS NULL OR c.lastContactDate < :since)
        ORDER BY c.lastContactDate ASC NULLS FIRST
        """)
    List<Contact> findNotContactedSince(
        @Param("tenantId") UUID tenantId,
        @Param("since") LocalDate since
    );

    // Top relationship scores
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.relationshipScore IS NOT NULL
        ORDER BY c.relationshipScore DESC
        """)
    Page<Contact> findTopRelationships(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Government contacts
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.contactType IN ('GOVERNMENT_CUSTOMER', 'CONTRACTING_OFFICER', 'CONTRACTING_SPECIALIST', 'PROGRAM_MANAGER', 'TECHNICAL_POC', 'COR')
        """)
    Page<Contact> findGovernmentContacts(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Partner contacts
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.contactType IN ('PRIME_CONTRACTOR', 'SUBCONTRACTOR', 'TEAMING_PARTNER')
        """)
    Page<Contact> findPartnerContacts(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Count by type
    @Query("SELECT COUNT(c) FROM Contact c WHERE c.tenant.id = :tenantId AND c.contactType = :type AND c.status <> 'ARCHIVED'")
    long countByTenantIdAndContactType(@Param("tenantId") UUID tenantId, @Param("type") ContactType type);

    // Duplicate detection
    @Query("""
        SELECT c FROM Contact c
        WHERE c.tenant.id = :tenantId
        AND c.status <> 'ARCHIVED'
        AND (c.email = :email OR (c.firstName = :firstName AND c.lastName = :lastName))
        """)
    List<Contact> findPotentialDuplicates(
        @Param("tenantId") UUID tenantId,
        @Param("email") String email,
        @Param("firstName") String firstName,
        @Param("lastName") String lastName
    );
}
