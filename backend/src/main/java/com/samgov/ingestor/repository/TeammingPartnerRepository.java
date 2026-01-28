package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.TeammingPartner;
import com.samgov.ingestor.model.TeammingPartner.PartnerStatus;
import com.samgov.ingestor.model.TeammingPartner.PartnerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeammingPartnerRepository extends JpaRepository<TeammingPartner, UUID> {

    Page<TeammingPartner> findByTenantId(UUID tenantId, Pageable pageable);

    Optional<TeammingPartner> findByIdAndTenantId(UUID id, UUID tenantId);

    List<TeammingPartner> findByTenantIdAndStatus(UUID tenantId, PartnerStatus status);

    List<TeammingPartner> findByTenantIdAndPartnerType(UUID tenantId, PartnerType partnerType);

    Optional<TeammingPartner> findByUeiAndTenantId(String uei, UUID tenantId);

    Optional<TeammingPartner> findByCageCodeAndTenantId(String cageCode, UUID tenantId);

    @Query("SELECT p FROM TeammingPartner p WHERE p.tenant.id = :tenantId AND p.status = 'ACTIVE'")
    List<TeammingPartner> findActivePartners(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM TeammingPartner p WHERE p.tenant.id = :tenantId AND p.isSmallBusiness = true AND p.status = 'ACTIVE'")
    List<TeammingPartner> findActiveSmallBusinessPartners(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM TeammingPartner p JOIN p.capabilities c WHERE p.tenant.id = :tenantId AND c = :capability AND p.status = 'ACTIVE'")
    List<TeammingPartner> findByCapability(
        @Param("tenantId") UUID tenantId,
        @Param("capability") String capability
    );

    @Query("SELECT p FROM TeammingPartner p JOIN p.naicsCodes n WHERE p.tenant.id = :tenantId AND n = :naicsCode AND p.status = 'ACTIVE'")
    List<TeammingPartner> findByNaicsCode(
        @Param("tenantId") UUID tenantId,
        @Param("naicsCode") String naicsCode
    );

    @Query("SELECT p FROM TeammingPartner p WHERE p.tenant.id = :tenantId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<TeammingPartner> searchByName(
        @Param("tenantId") UUID tenantId,
        @Param("searchTerm") String searchTerm
    );

    @Query("SELECT COUNT(p) FROM TeammingPartner p WHERE p.tenant.id = :tenantId AND p.status = :status")
    long countByTenantIdAndStatus(
        @Param("tenantId") UUID tenantId,
        @Param("status") PartnerStatus status
    );

    boolean existsByUeiAndTenantId(String uei, UUID tenantId);

    boolean existsByCageCodeAndTenantId(String cageCode, UUID tenantId);
}
