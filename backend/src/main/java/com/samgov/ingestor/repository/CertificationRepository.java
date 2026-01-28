package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.Certification;
import com.samgov.ingestor.model.Certification.CertificationStatus;
import com.samgov.ingestor.model.Certification.CertificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, UUID> {

    Page<Certification> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<Certification> findByTenantIdAndId(UUID tenantId, UUID id);

    List<Certification> findByTenantIdAndCertificationType(UUID tenantId, CertificationType type);

    Page<Certification> findByTenantIdAndCertificationType(UUID tenantId, CertificationType type, Pageable pageable);

    List<Certification> findByTenantIdAndStatus(UUID tenantId, CertificationStatus status);

    // For analytics
    Page<Certification> findByTenantIdOrderByExpirationDateAsc(UUID tenantId, Pageable pageable);

    List<Certification> findByTenantIdAndExpirationDateBefore(UUID tenantId, LocalDate date);

    @Query("SELECT c FROM Certification c WHERE c.tenant.id = :tenantId AND c.expirationDate <= :deadline AND c.expirationDate >= CURRENT_DATE AND c.status = 'ACTIVE'")
    List<Certification> findExpiringWithinDays(@Param("tenantId") UUID tenantId, @Param("deadline") LocalDate deadline);

    default List<Certification> findExpiringWithinDays(UUID tenantId, int days) {
        return findExpiringWithinDays(tenantId, LocalDate.now().plusDays(days));
    }

    // Active certifications
    @Query("SELECT c FROM Certification c WHERE c.tenant.id = :tenantId AND c.status = 'ACTIVE'")
    List<Certification> findActiveCertifications(@Param("tenantId") UUID tenantId);

    // Expiring certifications
    @Query("""
        SELECT c FROM Certification c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.expirationDate IS NOT NULL
        AND c.expirationDate <= :deadline
        AND c.expirationDate >= :today
        ORDER BY c.expirationDate ASC
        """)
    List<Certification> findExpiringCertifications(
        @Param("tenantId") UUID tenantId,
        @Param("today") LocalDate today,
        @Param("deadline") LocalDate deadline
    );

    // Expired certifications
    @Query("""
        SELECT c FROM Certification c
        WHERE c.tenant.id = :tenantId
        AND c.expirationDate IS NOT NULL
        AND c.expirationDate < :today
        AND c.status != 'EXPIRED'
        """)
    List<Certification> findExpiredCertifications(@Param("tenantId") UUID tenantId, @Param("today") LocalDate today);

    // SAM registration
    @Query("SELECT c FROM Certification c WHERE c.tenant.id = :tenantId AND c.certificationType = 'SAM_REGISTRATION'")
    Optional<Certification> findSamRegistration(@Param("tenantId") UUID tenantId);

    // Small business certifications
    @Query("""
        SELECT c FROM Certification c
        WHERE c.tenant.id = :tenantId
        AND c.certificationType IN ('EIGHT_A', 'HUBZONE', 'WOSB', 'EDWOSB', 'SDVOSB', 'VOSB')
        AND c.status = 'ACTIVE'
        """)
    List<Certification> findActiveSmallBusinessCertifications(@Param("tenantId") UUID tenantId);

    // Certifications needing reminder
    @Query("""
        SELECT c FROM Certification c
        WHERE c.tenant.id = :tenantId
        AND c.status = 'ACTIVE'
        AND c.reminderSent = false
        AND c.expirationDate IS NOT NULL
        AND c.expirationDate <= :deadline
        """)
    List<Certification> findCertificationsNeedingReminder(
        @Param("tenantId") UUID tenantId,
        @Param("deadline") LocalDate deadline
    );

    // Count by status
    @Query("SELECT COUNT(c) FROM Certification c WHERE c.tenant.id = :tenantId AND c.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") CertificationStatus status);

    // By NAICS code
    List<Certification> findByTenantIdAndNaicsCode(UUID tenantId, String naicsCode);
}
