package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Organization;
import com.samgov.ingestor.model.Organization.OrganizationStatus;
import com.samgov.ingestor.model.Organization.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID>, JpaSpecificationExecutor<Organization> {

    Page<Organization> findByTenantIdAndStatusNot(UUID tenantId, OrganizationStatus status, Pageable pageable);

    Optional<Organization> findByTenantIdAndId(UUID tenantId, UUID id);

    Optional<Organization> findByTenantIdAndUei(UUID tenantId, String uei);

    Optional<Organization> findByTenantIdAndCageCode(UUID tenantId, String cageCode);

    boolean existsByTenantIdAndUei(UUID tenantId, String uei);

    boolean existsByTenantIdAndCageCode(UUID tenantId, String cageCode);

    // By type
    Page<Organization> findByTenantIdAndOrganizationTypeAndStatusNot(
        UUID tenantId,
        OrganizationType organizationType,
        OrganizationStatus status,
        Pageable pageable
    );

    List<Organization> findByTenantIdAndOrganizationTypeAndStatusNot(
        UUID tenantId,
        OrganizationType organizationType,
        OrganizationStatus status
    );

    // By owner
    Page<Organization> findByOwnerIdAndStatusNot(UUID ownerId, OrganizationStatus status, Pageable pageable);

    // Parent/child relationships
    List<Organization> findByParentOrganizationIdAndStatusNot(UUID parentId, OrganizationStatus status);

    // Search
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status <> 'ARCHIVED'
        AND (LOWER(o.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.legalName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.uei) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.cageCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(o.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))
        """)
    Page<Organization> searchOrganizations(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    // Government agencies
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status <> 'ARCHIVED'
        AND o.organizationType IN ('GOVERNMENT_AGENCY', 'GOVERNMENT_OFFICE')
        ORDER BY o.name
        """)
    Page<Organization> findGovernmentAgencies(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Prime contractors
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status <> 'ARCHIVED'
        AND o.organizationType = 'PRIME_CONTRACTOR'
        ORDER BY o.name
        """)
    Page<Organization> findPrimeContractors(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Teaming partners
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status = 'ACTIVE'
        AND o.organizationType IN ('TEAMING_PARTNER', 'SUBCONTRACTOR')
        ORDER BY o.name
        """)
    List<Organization> findTeamingPartners(@Param("tenantId") UUID tenantId);

    // Competitors
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status <> 'ARCHIVED'
        AND o.organizationType = 'COMPETITOR'
        ORDER BY o.name
        """)
    Page<Organization> findCompetitors(@Param("tenantId") UUID tenantId, Pageable pageable);

    // By NAICS code
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status <> 'ARCHIVED'
        AND o.naicsCodes LIKE CONCAT('%', :naicsCode, '%')
        """)
    List<Organization> findByNaicsCode(@Param("tenantId") UUID tenantId, @Param("naicsCode") String naicsCode);

    // By relationship tier
    List<Organization> findByTenantIdAndRelationshipTierAndStatusNot(
        UUID tenantId,
        String relationshipTier,
        OrganizationStatus status
    );

    // Top relationships
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status = 'ACTIVE'
        AND o.relationshipScore IS NOT NULL
        ORDER BY o.relationshipScore DESC
        """)
    Page<Organization> findTopRelationships(@Param("tenantId") UUID tenantId, Pageable pageable);

    // Count by type
    @Query("SELECT COUNT(o) FROM Organization o WHERE o.tenant.id = :tenantId AND o.organizationType = :type AND o.status <> 'ARCHIVED'")
    long countByTenantIdAndOrganizationType(@Param("tenantId") UUID tenantId, @Param("type") OrganizationType type);

    // Duplicate detection
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status <> 'ARCHIVED'
        AND (o.uei = :uei OR o.cageCode = :cageCode OR LOWER(o.name) = LOWER(:name))
        """)
    List<Organization> findPotentialDuplicates(
        @Param("tenantId") UUID tenantId,
        @Param("uei") String uei,
        @Param("cageCode") String cageCode,
        @Param("name") String name
    );

    // Organizations with capabilities matching keywords
    @Query("""
        SELECT o FROM Organization o
        WHERE o.tenant.id = :tenantId
        AND o.status = 'ACTIVE'
        AND o.organizationType IN ('TEAMING_PARTNER', 'SUBCONTRACTOR')
        AND (o.capabilities LIKE CONCAT('%', :keyword, '%')
             OR o.coreCompetencies LIKE CONCAT('%', :keyword, '%'))
        """)
    List<Organization> findPartnersWithCapability(
        @Param("tenantId") UUID tenantId,
        @Param("keyword") String keyword
    );
}
