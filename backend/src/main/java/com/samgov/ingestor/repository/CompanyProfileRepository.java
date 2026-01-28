package com.samgov.ingestor.repository;

import com.samgov.ingestor.model.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, UUID> {

    Optional<CompanyProfile> findByTenantId(UUID tenantId);

    Optional<CompanyProfile> findByUei(String uei);

    Optional<CompanyProfile> findByCageCode(String cageCode);

    List<CompanyProfile> findByPrimaryNaicsContaining(String naicsCode);

    List<CompanyProfile> findBySamExpirationDateBefore(LocalDate date);

    List<CompanyProfile> findBySamExpirationDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT cp FROM CompanyProfile cp WHERE cp.is8a = true")
    List<CompanyProfile> find8aCompanies();

    @Query("SELECT cp FROM CompanyProfile cp WHERE cp.isHubzone = true")
    List<CompanyProfile> findHubzoneCompanies();

    @Query("SELECT cp FROM CompanyProfile cp WHERE cp.isSdvosb = true")
    List<CompanyProfile> findSdvosbCompanies();

    @Query("SELECT cp FROM CompanyProfile cp WHERE cp.isWosb = true OR cp.isEdwosb = true")
    List<CompanyProfile> findWomenOwnedCompanies();

    @Query("SELECT cp FROM CompanyProfile cp WHERE cp.hasFacilityClearance = true")
    List<CompanyProfile> findClearedCompanies();

    @Query("SELECT cp FROM CompanyProfile cp WHERE cp.gsaScheduleHolder = true")
    List<CompanyProfile> findGsaScheduleHolders();

    @Query("SELECT cp FROM CompanyProfile cp WHERE " +
           "(:state IS NULL OR cp.headquartersState = :state) AND " +
           "(:naics IS NULL OR cp.primaryNaics LIKE %:naics%)")
    List<CompanyProfile> findByStateAndNaics(@Param("state") String state, @Param("naics") String naics);

    boolean existsByUei(String uei);

    boolean existsByCageCode(String cageCode);
}
