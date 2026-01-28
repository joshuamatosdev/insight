package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.CompanyProfile.SamStatus;
import com.samgov.ingestor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Company profile management service.
 * Manages tenant company profiles for opportunity matching.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyProfileService {

    private final CompanyProfileRepository profileRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public record CreateProfileRequest(
        String legalName,
        String dbaName,
        String uei,
        String cageCode,
        String duns,
        String ein,
        SamStatus samStatus,
        LocalDate samExpirationDate,
        LocalDate samRegistrationDate,
        String businessType,
        String organizationStructure,
        Integer yearEstablished,
        Integer employeeCount,
        BigDecimal annualRevenue,
        String primaryNaics,
        String secondaryNaics,
        String pscCodes,
        Boolean isSmallBusiness,
        Boolean is8a,
        Boolean isHubzone,
        Boolean isSdvosb,
        Boolean isWosb,
        Boolean isEdwosb,
        Boolean isVosb,
        Boolean isSdb,
        Boolean hasFacilityClearance,
        String facilityClearanceLevel,
        Boolean isItarRegistered,
        LocalDate itarRegistrationExpiry,
        Boolean isCmmcCertified,
        String cmmcLevel,
        String isoCertifications,
        Boolean gsaScheduleHolder,
        String gsaContractNumbers,
        String otherContractVehicles,
        String headquartersState,
        String headquartersCity,
        String serviceRegions,
        String capabilitiesStatement,
        String coreCompetencies,
        String pastPerformanceSummary,
        String differentiators,
        Boolean targetFederal,
        Boolean targetDod,
        Boolean targetState,
        Boolean targetLocal,
        Boolean targetCommercial
    ) {}

    public record ProfileResponse(
        UUID id,
        UUID tenantId,
        String legalName,
        String dbaName,
        String uei,
        String cageCode,
        SamStatus samStatus,
        LocalDate samExpirationDate,
        Integer employeeCount,
        BigDecimal annualRevenue,
        String primaryNaics,
        Boolean isSmallBusiness,
        Boolean is8a,
        Boolean isHubzone,
        Boolean isSdvosb,
        Boolean isWosb,
        Boolean hasFacilityClearance,
        Boolean isItarRegistered,
        Boolean isCmmcCertified,
        Boolean gsaScheduleHolder,
        String headquartersState,
        Boolean targetFederal,
        Boolean targetDod,
        Boolean targetState,
        Boolean targetLocal,
        List<String> certifications,
        Integer samDaysUntilExpiry
    ) {}

    @Transactional
    public ProfileResponse createOrUpdateProfile(UUID tenantId, UUID userId, CreateProfileRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        CompanyProfile profile = profileRepository.findByTenantId(tenantId)
            .orElse(new CompanyProfile());

        boolean isNew = profile.getId() == null;
        profile.setTenant(tenant);

        // Set all fields
        profile.setLegalName(request.legalName());
        profile.setDbaName(request.dbaName());
        profile.setUei(request.uei());
        profile.setCageCode(request.cageCode());
        profile.setDuns(request.duns());
        profile.setEin(request.ein());
        profile.setSamStatus(request.samStatus() != null ? request.samStatus() : SamStatus.NOT_REGISTERED);
        profile.setSamExpirationDate(request.samExpirationDate());
        profile.setSamRegistrationDate(request.samRegistrationDate());
        profile.setBusinessType(request.businessType());
        profile.setOrganizationStructure(request.organizationStructure());
        profile.setYearEstablished(request.yearEstablished());
        profile.setEmployeeCount(request.employeeCount());
        profile.setAnnualRevenue(request.annualRevenue());
        profile.setPrimaryNaics(request.primaryNaics());
        profile.setSecondaryNaics(request.secondaryNaics());
        profile.setPscCodes(request.pscCodes());

        // Certifications
        profile.setIsSmallBusiness(request.isSmallBusiness() != null ? request.isSmallBusiness() : false);
        profile.setIs8a(request.is8a() != null ? request.is8a() : false);
        profile.setIsHubzone(request.isHubzone() != null ? request.isHubzone() : false);
        profile.setIsSdvosb(request.isSdvosb() != null ? request.isSdvosb() : false);
        profile.setIsWosb(request.isWosb() != null ? request.isWosb() : false);
        profile.setIsEdwosb(request.isEdwosb() != null ? request.isEdwosb() : false);
        profile.setIsVosb(request.isVosb() != null ? request.isVosb() : false);
        profile.setIsSdb(request.isSdb() != null ? request.isSdb() : false);

        // Security
        profile.setHasFacilityClearance(request.hasFacilityClearance() != null ? request.hasFacilityClearance() : false);
        profile.setFacilityClearanceLevel(request.facilityClearanceLevel());
        profile.setIsItarRegistered(request.isItarRegistered() != null ? request.isItarRegistered() : false);
        profile.setItarRegistrationExpiry(request.itarRegistrationExpiry());
        profile.setIsCmmcCertified(request.isCmmcCertified() != null ? request.isCmmcCertified() : false);
        profile.setCmmcLevel(request.cmmcLevel());
        profile.setIsoCertifications(request.isoCertifications());

        // Contract vehicles
        profile.setGsaScheduleHolder(request.gsaScheduleHolder() != null ? request.gsaScheduleHolder() : false);
        profile.setGsaContractNumbers(request.gsaContractNumbers());
        profile.setOtherContractVehicles(request.otherContractVehicles());

        // Location
        profile.setHeadquartersState(request.headquartersState());
        profile.setHeadquartersCity(request.headquartersCity());
        profile.setServiceRegions(request.serviceRegions());

        // Capabilities
        profile.setCapabilitiesStatement(request.capabilitiesStatement());
        profile.setCoreCompetencies(request.coreCompetencies());
        profile.setPastPerformanceSummary(request.pastPerformanceSummary());
        profile.setDifferentiators(request.differentiators());

        // Target markets
        profile.setTargetFederal(request.targetFederal() != null ? request.targetFederal() : true);
        profile.setTargetDod(request.targetDod() != null ? request.targetDod() : false);
        profile.setTargetState(request.targetState() != null ? request.targetState() : false);
        profile.setTargetLocal(request.targetLocal() != null ? request.targetLocal() : false);
        profile.setTargetCommercial(request.targetCommercial() != null ? request.targetCommercial() : false);

        profile = profileRepository.save(profile);

        auditService.logAction(isNew ? AuditAction.PROFILE_CREATED : AuditAction.PROFILE_UPDATED,
            "CompanyProfile", profile.getId().toString(), isNew ? "Created company profile" : "Updated company profile");

        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public Optional<ProfileResponse> getProfile(UUID tenantId) {
        return profileRepository.findByTenantId(tenantId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<ProfileResponse> getProfileByUei(String uei) {
        return profileRepository.findByUei(uei).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<CompanyProfile> getExpiringProfiles(int daysAhead) {
        LocalDate cutoff = LocalDate.now().plusDays(daysAhead);
        return profileRepository.findBySamExpirationDateBefore(cutoff);
    }

    @Transactional(readOnly = true)
    public List<CompanyProfile> getProfilesExpiringSoon(int daysAhead) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(daysAhead);
        return profileRepository.findBySamExpirationDateBetween(start, end);
    }

    @Transactional
    public void updateSamStatus(UUID tenantId, SamStatus status, LocalDate expirationDate) {
        CompanyProfile profile = profileRepository.findByTenantId(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Company profile not found"));

        profile.setSamStatus(status);
        profile.setSamExpirationDate(expirationDate);
        profileRepository.save(profile);

        log.info("Updated SAM status for tenant {} to {} (expires {})", tenantId, status, expirationDate);
    }

    private ProfileResponse toResponse(CompanyProfile profile) {
        List<String> certifications = new java.util.ArrayList<>();
        if (Boolean.TRUE.equals(profile.getIs8a())) certifications.add("8(a)");
        if (Boolean.TRUE.equals(profile.getIsHubzone())) certifications.add("HUBZone");
        if (Boolean.TRUE.equals(profile.getIsSdvosb())) certifications.add("SDVOSB");
        if (Boolean.TRUE.equals(profile.getIsWosb())) certifications.add("WOSB");
        if (Boolean.TRUE.equals(profile.getIsEdwosb())) certifications.add("EDWOSB");
        if (Boolean.TRUE.equals(profile.getIsVosb())) certifications.add("VOSB");
        if (Boolean.TRUE.equals(profile.getIsSdb())) certifications.add("SDB");

        Integer daysUntilExpiry = null;
        if (profile.getSamExpirationDate() != null) {
            daysUntilExpiry = (int) java.time.temporal.ChronoUnit.DAYS.between(
                LocalDate.now(), profile.getSamExpirationDate());
        }

        return new ProfileResponse(
            profile.getId(),
            profile.getTenant().getId(),
            profile.getLegalName(),
            profile.getDbaName(),
            profile.getUei(),
            profile.getCageCode(),
            profile.getSamStatus(),
            profile.getSamExpirationDate(),
            profile.getEmployeeCount(),
            profile.getAnnualRevenue(),
            profile.getPrimaryNaics(),
            profile.getIsSmallBusiness(),
            profile.getIs8a(),
            profile.getIsHubzone(),
            profile.getIsSdvosb(),
            profile.getIsWosb(),
            profile.getHasFacilityClearance(),
            profile.getIsItarRegistered(),
            profile.getIsCmmcCertified(),
            profile.getGsaScheduleHolder(),
            profile.getHeadquartersState(),
            profile.getTargetFederal(),
            profile.getTargetDod(),
            profile.getTargetState(),
            profile.getTargetLocal(),
            certifications,
            daysUntilExpiry
        );
    }
}
