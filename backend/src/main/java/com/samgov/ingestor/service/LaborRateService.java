package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
@Transactional
public class LaborRateService {

    private final LaborRateRepository laborRateRepository;
    private final TenantRepository tenantRepository;
    private final ContractRepository contractRepository;
    private final AuditService auditService;

    public LaborRateService(LaborRateRepository laborRateRepository, TenantRepository tenantRepository,
                            ContractRepository contractRepository, AuditService auditService) {
        this.laborRateRepository = laborRateRepository;
        this.tenantRepository = tenantRepository;
        this.contractRepository = contractRepository;
        this.auditService = auditService;
    }

    public record CreateLaborRateRequest(UUID contractId, String laborCategory, String laborCategoryDescription,
                                          Integer minYearsExperience, Integer maxYearsExperience,
                                          String educationRequirement, BigDecimal baseRate,
                                          BigDecimal fringeRate, BigDecimal overheadRate,
                                          BigDecimal gaRate, BigDecimal feeRate, BigDecimal billingRate,
                                          String rateType, LocalDate effectiveDate, LocalDate endDate,
                                          Integer fiscalYear, String notes) {}

    public record LaborRateResponse(UUID id, UUID contractId, String contractNumber, String laborCategory,
                                     String laborCategoryDescription, Integer minYearsExperience,
                                     Integer maxYearsExperience, String educationRequirement,
                                     BigDecimal baseRate, BigDecimal fringeRate, BigDecimal overheadRate,
                                     BigDecimal gaRate, BigDecimal feeRate, BigDecimal fullyBurdenedRate,
                                     BigDecimal billingRate, String rateType, LocalDate effectiveDate,
                                     LocalDate endDate, Integer fiscalYear, String notes, Boolean isActive,
                                     Instant createdAt) {}

    public LaborRateResponse createLaborRate(UUID tenantId, UUID userId, CreateLaborRateRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        LaborRate rate = new LaborRate();
        rate.setTenant(tenant);
        rate.setLaborCategory(request.laborCategory());
        rate.setLaborCategoryDescription(request.laborCategoryDescription());
        rate.setMinYearsExperience(request.minYearsExperience());
        rate.setMaxYearsExperience(request.maxYearsExperience());
        rate.setEducationRequirement(request.educationRequirement());
        rate.setBaseRate(request.baseRate());
        rate.setFringeRate(request.fringeRate());
        rate.setOverheadRate(request.overheadRate());
        rate.setGaRate(request.gaRate());
        rate.setFeeRate(request.feeRate());
        rate.setBillingRate(request.billingRate());
        rate.setRateType(request.rateType());
        rate.setEffectiveDate(request.effectiveDate());
        rate.setEndDate(request.endDate());
        rate.setFiscalYear(request.fiscalYear());
        rate.setNotes(request.notes());
        rate.setIsActive(true);

        if (request.contractId() != null) {
            Contract contract = contractRepository.findById(request.contractId())
                    .orElseThrow(() -> new IllegalArgumentException("Contract not found"));
            rate.setContract(contract);
        }

        rate = laborRateRepository.save(rate);
        auditService.logAction(AuditAction.LABOR_RATE_CREATED, "LaborRate", rate.getId().toString(),
                "Created labor rate: " + request.laborCategory());

        return toResponse(rate);
    }

    @Transactional(readOnly = true)
    public Page<LaborRateResponse> getLaborRates(UUID tenantId, Pageable pageable) {
        return laborRateRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<LaborRateResponse> getActiveLaborRates(UUID tenantId) {
        return laborRateRepository.findByTenantIdAndIsActiveTrue(tenantId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<LaborRateResponse> getActiveLaborRates(UUID tenantId, Pageable pageable) {
        return laborRateRepository.findByTenantIdAndIsActiveTrue(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<LaborRateResponse> getLaborRatesByContract(UUID contractId) {
        return laborRateRepository.findByContractId(contractId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<LaborRateResponse> getLaborRate(UUID rateId) {
        return laborRateRepository.findById(rateId).map(this::toResponse);
    }

    public LaborRateResponse updateLaborRate(UUID tenantId, UUID rateId, UUID userId, CreateLaborRateRequest request) {
        LaborRate rate = laborRateRepository.findById(rateId)
                .orElseThrow(() -> new IllegalArgumentException("Labor rate not found"));

        if (!rate.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Labor rate does not belong to tenant");
        }

        rate.setLaborCategory(request.laborCategory());
        rate.setLaborCategoryDescription(request.laborCategoryDescription());
        rate.setMinYearsExperience(request.minYearsExperience());
        rate.setMaxYearsExperience(request.maxYearsExperience());
        rate.setEducationRequirement(request.educationRequirement());
        rate.setBaseRate(request.baseRate());
        rate.setFringeRate(request.fringeRate());
        rate.setOverheadRate(request.overheadRate());
        rate.setGaRate(request.gaRate());
        rate.setFeeRate(request.feeRate());
        rate.setBillingRate(request.billingRate());
        rate.setRateType(request.rateType());
        rate.setEffectiveDate(request.effectiveDate());
        rate.setEndDate(request.endDate());
        rate.setFiscalYear(request.fiscalYear());
        rate.setNotes(request.notes());

        rate = laborRateRepository.save(rate);
        auditService.logAction(AuditAction.LABOR_RATE_UPDATED, "LaborRate", rateId.toString(), "Updated labor rate");

        return toResponse(rate);
    }

    public void setActive(UUID tenantId, UUID rateId, UUID userId, boolean active) {
        LaborRate rate = laborRateRepository.findById(rateId)
                .orElseThrow(() -> new IllegalArgumentException("Labor rate not found"));

        if (!rate.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Labor rate does not belong to tenant");
        }

        rate.setIsActive(active);
        laborRateRepository.save(rate);
        auditService.logAction(AuditAction.LABOR_RATE_UPDATED, "LaborRate", rateId.toString(),
                (active ? "Activated" : "Deactivated") + " labor rate");
    }

    public void deleteLaborRate(UUID tenantId, UUID rateId, UUID userId) {
        LaborRate rate = laborRateRepository.findById(rateId)
                .orElseThrow(() -> new IllegalArgumentException("Labor rate not found"));

        if (!rate.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Labor rate does not belong to tenant");
        }

        laborRateRepository.delete(rate);
        auditService.logAction(AuditAction.LABOR_RATE_DELETED, "LaborRate", rateId.toString(),
                "Deleted labor rate: " + rate.getLaborCategory());
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctCategories(UUID tenantId) {
        return laborRateRepository.findDistinctLaborCategoriesByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<LaborRateResponse> getLaborRatesByCategory(UUID tenantId, String category) {
        return laborRateRepository.findByTenantIdAndLaborCategory(tenantId, category)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<LaborRateResponse> getLaborRatesByContractVehicle(UUID tenantId, String contractVehicle) {
        return laborRateRepository.findByTenantIdAndContractVehicle(tenantId, contractVehicle)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctContractVehicles(UUID tenantId) {
        return laborRateRepository.findDistinctContractVehiclesByTenantId(tenantId);
    }

    private LaborRateResponse toResponse(LaborRate rate) {
        String contractNumber = rate.getContract() != null ? rate.getContract().getContractNumber() : null;
        UUID contractId = rate.getContract() != null ? rate.getContract().getId() : null;

        return new LaborRateResponse(rate.getId(), contractId, contractNumber, rate.getLaborCategory(),
                rate.getLaborCategoryDescription(), rate.getMinYearsExperience(), rate.getMaxYearsExperience(),
                rate.getEducationRequirement(), rate.getBaseRate(), rate.getFringeRate(), rate.getOverheadRate(),
                rate.getGaRate(), rate.getFeeRate(), rate.getFullyBurdenedRate(), rate.getBillingRate(),
                rate.getRateType(), rate.getEffectiveDate(), rate.getEndDate(), rate.getFiscalYear(),
                rate.getNotes(), rate.getIsActive(), rate.getCreatedAt());
    }
}
