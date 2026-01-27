package com.samgov.ingestor.service;

import com.samgov.ingestor.model.CaptureAction;
import com.samgov.ingestor.model.CaptureAction.ActionStatus;
import com.samgov.ingestor.model.CapturePlan;
import com.samgov.ingestor.model.CapturePlan.BidDecision;
import com.samgov.ingestor.model.CapturePlan.CapturePhase;
import com.samgov.ingestor.model.CapturePlan.CaptureStatus;
import com.samgov.ingestor.repository.CaptureActionRepository;
import com.samgov.ingestor.repository.CapturePlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CapturePlanService {

    private final CapturePlanRepository capturePlanRepository;
    private final CaptureActionRepository captureActionRepository;

    // Capture Plan operations
    public Page<CapturePlan> getPlansByTenant(UUID tenantId, Pageable pageable) {
        return capturePlanRepository.findByTenantId(tenantId, pageable);
    }

    public Optional<CapturePlan> getPlan(UUID id, UUID tenantId) {
        return capturePlanRepository.findByIdAndTenantId(id, tenantId);
    }

    public CapturePlan createPlan(CapturePlan plan) {
        log.info("Creating capture plan: {} for tenant: {}", plan.getTitle(), plan.getTenant().getId());
        return capturePlanRepository.save(plan);
    }

    public CapturePlan updatePlan(CapturePlan plan) {
        log.info("Updating capture plan: {}", plan.getId());
        return capturePlanRepository.save(plan);
    }

    public void deletePlan(UUID id) {
        log.info("Deleting capture plan: {}", id);
        captureActionRepository.deleteByCapturePlanId(id);
        capturePlanRepository.deleteById(id);
    }

    public List<CapturePlan> getActivePlans(UUID tenantId) {
        return capturePlanRepository.findActivePlans(tenantId);
    }

    public List<CapturePlan> getPlansByStatus(UUID tenantId, CaptureStatus status) {
        return capturePlanRepository.findByTenantIdAndStatus(tenantId, status);
    }

    public List<CapturePlan> getPlansByPhase(UUID tenantId, CapturePhase phase) {
        return capturePlanRepository.findByTenantIdAndPhase(tenantId, phase);
    }

    public List<CapturePlan> getHighProbabilityPlans(UUID tenantId, int minPwin) {
        return capturePlanRepository.findHighProbabilityPlans(tenantId, minPwin);
    }

    public List<CapturePlan> getTopPlans(UUID tenantId, Pageable pageable) {
        return capturePlanRepository.findActivePlansByPwinDesc(tenantId, pageable);
    }

    public List<CapturePlan> getPendingBidDecision(UUID tenantId) {
        return capturePlanRepository.findPendingBidDecision(tenantId);
    }

    public CapturePlan updateWinProbability(UUID id, UUID tenantId, Integer pwin) {
        CapturePlan plan = capturePlanRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Capture plan not found"));
        
        plan.setWinProbability(pwin);
        log.info("Updating capture plan {} Pwin to: {}%", id, pwin);
        return capturePlanRepository.save(plan);
    }

    public CapturePlan updatePhase(UUID id, UUID tenantId, CapturePhase phase) {
        CapturePlan plan = capturePlanRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Capture plan not found"));
        
        plan.setPhase(phase);
        log.info("Updating capture plan {} phase to: {}", id, phase);
        return capturePlanRepository.save(plan);
    }

    public CapturePlan recordBidDecision(UUID id, UUID tenantId, BidDecision decision, String rationale) {
        CapturePlan plan = capturePlanRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Capture plan not found"));
        
        plan.setBidDecision(decision);
        plan.setBidDecisionDate(LocalDate.now());
        plan.setBidDecisionRationale(rationale);
        
        if (decision == BidDecision.NO_BID) {
            plan.setStatus(CaptureStatus.NO_BID);
        } else if (decision == BidDecision.BID) {
            plan.setStatus(CaptureStatus.BID);
            plan.setPhase(CapturePhase.PROPOSAL);
        }
        
        log.info("Recording bid decision {} for capture plan: {}", decision, id);
        return capturePlanRepository.save(plan);
    }

    public Double getAverageWinProbability(UUID tenantId) {
        return capturePlanRepository.getAverageWinProbability(tenantId);
    }

    public BigDecimal getTotalPipelineValue(UUID tenantId) {
        return capturePlanRepository.getTotalPipelineValue(tenantId);
    }

    // Capture Action operations
    public List<CaptureAction> getActionsByPlan(UUID planId) {
        return captureActionRepository.findByCapturePlanId(planId);
    }

    public Optional<CaptureAction> getAction(UUID id, UUID planId) {
        return captureActionRepository.findByIdAndCapturePlanId(id, planId);
    }

    public CaptureAction createAction(CaptureAction action) {
        log.info("Creating capture action: {} for plan: {}", action.getTitle(), action.getCapturePlan().getId());
        return captureActionRepository.save(action);
    }

    public CaptureAction updateAction(CaptureAction action) {
        log.info("Updating capture action: {}", action.getId());
        return captureActionRepository.save(action);
    }

    public void deleteAction(UUID id) {
        log.info("Deleting capture action: {}", id);
        captureActionRepository.deleteById(id);
    }

    public CaptureAction completeAction(UUID id, UUID planId, String outcome) {
        CaptureAction action = captureActionRepository.findByIdAndCapturePlanId(id, planId)
            .orElseThrow(() -> new IllegalArgumentException("Action not found"));
        
        action.complete();
        action.setOutcome(outcome);
        log.info("Completing capture action: {}", id);
        return captureActionRepository.save(action);
    }

    public List<CaptureAction> getPendingActions(UUID planId) {
        return captureActionRepository.findPendingActions(planId);
    }

    public List<CaptureAction> getOverdueActions(UUID planId) {
        return captureActionRepository.findOverdueActions(planId, LocalDate.now());
    }

    public List<CaptureAction> getActionsByAssignee(UUID userId, Pageable pageable) {
        return captureActionRepository.findPendingByAssignedTo(userId, pageable);
    }

    public double getActionCompletionRate(UUID planId) {
        long total = captureActionRepository.countByCapturePlanId(planId);
        if (total == 0) {
            return 0.0;
        }
        long completed = captureActionRepository.countCompletedByCapturePlanId(planId);
        return (double) completed / total * 100;
    }

    public long countActionsByStatus(UUID planId, ActionStatus status) {
        return captureActionRepository.countByCapturePlanIdAndStatus(planId, status);
    }
}
