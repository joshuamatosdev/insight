package com.samgov.ingestor.service;

import com.samgov.ingestor.model.*;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.SecurityClearance.ClearanceLevel;
import com.samgov.ingestor.model.SecurityClearance.ClearanceStatus;
import com.samgov.ingestor.model.SecurityClearance.ClearanceType;
import com.samgov.ingestor.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class SecurityClearanceService {

    private final SecurityClearanceRepository clearanceRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public SecurityClearanceService(SecurityClearanceRepository clearanceRepository,
                                     TenantRepository tenantRepository, UserRepository userRepository,
                                     AuditService auditService) {
        this.clearanceRepository = clearanceRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public record CreateClearanceRequest(UUID userId, ClearanceLevel clearanceLevel, ClearanceType clearanceType,
                                          LocalDate investigationDate, LocalDate grantDate, LocalDate expirationDate,
                                          String polygraphType, LocalDate polygraphDate, String sponsoringAgency,
                                          String notes) {}

    public record ClearanceResponse(UUID id, UUID userId, String userName, ClearanceLevel clearanceLevel,
                                     ClearanceType clearanceType, ClearanceStatus status,
                                     LocalDate investigationDate, LocalDate grantDate,
                                     LocalDate expirationDate, Long daysUntilExpiration,
                                     String polygraphType, LocalDate polygraphDate, String sponsoringAgency, String notes) {}

    public ClearanceResponse createClearance(UUID tenantId, UUID adminUserId, CreateClearanceRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        SecurityClearance clearance = new SecurityClearance();
        clearance.setTenant(tenant);
        clearance.setUser(user);
        clearance.setClearanceLevel(request.clearanceLevel());
        clearance.setClearanceType(request.clearanceType() != null ? request.clearanceType() : ClearanceType.PERSONNEL);
        clearance.setInvestigationDate(request.investigationDate());
        clearance.setGrantDate(request.grantDate());
        clearance.setExpirationDate(request.expirationDate());
        clearance.setPolygraphType(request.polygraphType());
        clearance.setPolygraphDate(request.polygraphDate());
        clearance.setSponsoringAgency(request.sponsoringAgency());
        clearance.setNotes(request.notes());
        clearance.setStatus(request.grantDate() != null ? ClearanceStatus.ACTIVE : ClearanceStatus.PENDING);

        clearance = clearanceRepository.save(clearance);
        auditService.logAction(AuditAction.CLEARANCE_CREATED, "SecurityClearance", clearance.getId().toString(),
                "Created clearance for user: " + user.getEmail() + " at level: " + request.clearanceLevel());

        return toResponse(clearance);
    }

    @Transactional(readOnly = true)
    public Page<ClearanceResponse> getClearances(UUID tenantId, Pageable pageable) {
        return clearanceRepository.findByTenantId(tenantId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ClearanceResponse> getClearancesByLevel(UUID tenantId, ClearanceLevel level) {
        return clearanceRepository.findByTenantIdAndClearanceLevel(tenantId, level)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<ClearanceResponse> getClearancesByLevel(UUID tenantId, ClearanceLevel level, Pageable pageable) {
        return clearanceRepository.findByTenantIdAndClearanceLevel(tenantId, level, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ClearanceResponse> getClearanceByUser(UUID userId) {
        return clearanceRepository.findByUserId(userId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public java.util.Optional<ClearanceResponse> getClearanceByUser(UUID tenantId, UUID userId) {
        return clearanceRepository.findByTenantIdAndUserId(tenantId, userId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ClearanceResponse> getExpiringClearances(UUID tenantId, int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(daysAhead);
        return clearanceRepository.findExpiringClearances(tenantId, today, deadline)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ClearanceResponse> getClearancesAtLevelOrAbove(UUID tenantId, ClearanceLevel minLevel) {
        return clearanceRepository.findPersonnelWithClearanceLevels(tenantId, getLevelsAtOrAbove(minLevel))
                .stream().map(this::toResponse).toList();
    }

    public ClearanceResponse updateClearance(UUID tenantId, UUID clearanceId, UUID adminUserId, CreateClearanceRequest request) {
        SecurityClearance clearance = clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new IllegalArgumentException("Clearance not found"));

        if (!clearance.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Clearance does not belong to tenant");
        }

        clearance.setClearanceLevel(request.clearanceLevel());
        clearance.setClearanceType(request.clearanceType());
        clearance.setInvestigationDate(request.investigationDate());
        clearance.setGrantDate(request.grantDate());
        clearance.setExpirationDate(request.expirationDate());
        clearance.setPolygraphType(request.polygraphType());
        clearance.setPolygraphDate(request.polygraphDate());
        clearance.setSponsoringAgency(request.sponsoringAgency());
        clearance.setNotes(request.notes());

        clearance = clearanceRepository.save(clearance);
        auditService.logAction(AuditAction.CLEARANCE_UPDATED, "SecurityClearance", clearanceId.toString(),
                "Updated clearance");

        return toResponse(clearance);
    }

    public void updateStatus(UUID tenantId, UUID clearanceId, UUID adminUserId, ClearanceStatus status) {
        SecurityClearance clearance = clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new IllegalArgumentException("Clearance not found"));

        if (!clearance.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Clearance does not belong to tenant");
        }

        clearance.setStatus(status);
        clearanceRepository.save(clearance);
        auditService.logAction(AuditAction.CLEARANCE_UPDATED, "SecurityClearance", clearanceId.toString(),
                "Updated status to: " + status);
    }

    public void deleteClearance(UUID tenantId, UUID clearanceId, UUID adminUserId) {
        SecurityClearance clearance = clearanceRepository.findById(clearanceId)
                .orElseThrow(() -> new IllegalArgumentException("Clearance not found"));

        if (!clearance.getTenant().getId().equals(tenantId)) {
            throw new IllegalArgumentException("Clearance does not belong to tenant");
        }

        clearanceRepository.delete(clearance);
        auditService.logAction(AuditAction.CLEARANCE_UPDATED, "SecurityClearance", clearanceId.toString(),
                "Deleted clearance for user");
    }

    @Transactional(readOnly = true)
    public List<ClearanceResponse> getActiveClearances(UUID tenantId) {
        return clearanceRepository.findActiveClearances(tenantId)
                .stream().map(this::toResponse).toList();
    }

    private List<ClearanceLevel> getLevelsAtOrAbove(ClearanceLevel minLevel) {
        List<ClearanceLevel> levels = new ArrayList<>();
        ClearanceLevel[] allLevels = ClearanceLevel.values();
        boolean include = false;
        for (ClearanceLevel level : allLevels) {
            if (level == minLevel) include = true;
            if (include) levels.add(level);
        }
        return levels;
    }

    private ClearanceResponse toResponse(SecurityClearance clearance) {
        Long daysUntilExpiration = null;
        if (clearance.getExpirationDate() != null) {
            daysUntilExpiration = ChronoUnit.DAYS.between(LocalDate.now(), clearance.getExpirationDate());
        }

        String userName = "Unknown";
        UUID userId = null;
        if (clearance.getUser() != null) {
            userId = clearance.getUser().getId();
            userName = clearance.getUser().getFirstName() + " " + clearance.getUser().getLastName();
        } else if (clearance.getEntityName() != null) {
            userName = clearance.getEntityName();
        }

        return new ClearanceResponse(clearance.getId(), userId, userName,
                clearance.getClearanceLevel(), clearance.getClearanceType(), clearance.getStatus(),
                clearance.getInvestigationDate(), clearance.getGrantDate(), clearance.getExpirationDate(),
                daysUntilExpiration, clearance.getPolygraphType(), clearance.getPolygraphDate(),
                clearance.getSponsoringAgency(), clearance.getNotes());
    }
}
