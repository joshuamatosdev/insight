package com.samgov.ingestor.controller;

import com.samgov.ingestor.model.CaptureAction;
import com.samgov.ingestor.model.CapturePlan;
import com.samgov.ingestor.model.CapturePlan.BidDecision;
import com.samgov.ingestor.model.CapturePlan.CapturePhase;
import com.samgov.ingestor.model.CapturePlan.CaptureStatus;
import com.samgov.ingestor.service.CapturePlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/capture-plans")
@RequiredArgsConstructor
public class CapturePlanController {

    private final CapturePlanService capturePlanService;

    @GetMapping
    public ResponseEntity<Page<CapturePlan>> getPlans(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(capturePlanService.getPlansByTenant(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CapturePlan> getPlan(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return capturePlanService.getPlan(id, tenantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CapturePlan> createPlan(
            @RequestBody CapturePlan plan,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        CapturePlan created = capturePlanService.createPlan(plan);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CapturePlan> updatePlan(
            @PathVariable UUID id,
            @RequestBody CapturePlan plan,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!capturePlanService.getPlan(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        plan.setId(id);
        return ResponseEntity.ok(capturePlanService.updatePlan(plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable UUID id,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        if (!capturePlanService.getPlan(id, tenantId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        capturePlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<CapturePlan>> getActivePlans(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(capturePlanService.getActivePlans(tenantId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CapturePlan>> getByStatus(
            @PathVariable CaptureStatus status,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(capturePlanService.getPlansByStatus(tenantId, status));
    }

    @GetMapping("/phase/{phase}")
    public ResponseEntity<List<CapturePlan>> getByPhase(
            @PathVariable CapturePhase phase,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(capturePlanService.getPlansByPhase(tenantId, phase));
    }

    @GetMapping("/high-probability")
    public ResponseEntity<List<CapturePlan>> getHighProbability(
            @RequestParam(defaultValue = "70") int minPwin,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(capturePlanService.getHighProbabilityPlans(tenantId, minPwin));
    }

    @GetMapping("/top")
    public ResponseEntity<List<CapturePlan>> getTopPlans(
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(capturePlanService.getTopPlans(tenantId, PageRequest.of(0, limit)));
    }

    @GetMapping("/pending-decision")
    public ResponseEntity<List<CapturePlan>> getPendingBidDecision(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        return ResponseEntity.ok(capturePlanService.getPendingBidDecision(tenantId));
    }

    @PatchMapping("/{id}/pwin")
    public ResponseEntity<CapturePlan> updateWinProbability(
            @PathVariable UUID id,
            @RequestParam Integer pwin,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            CapturePlan updated = capturePlanService.updateWinProbability(id, tenantId, pwin);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/phase")
    public ResponseEntity<CapturePlan> updatePhase(
            @PathVariable UUID id,
            @RequestParam CapturePhase phase,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            CapturePlan updated = capturePlanService.updatePhase(id, tenantId, phase);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/bid-decision")
    public ResponseEntity<CapturePlan> recordBidDecision(
            @PathVariable UUID id,
            @RequestParam BidDecision decision,
            @RequestParam(required = false) String rationale,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        try {
            CapturePlan updated = capturePlanService.recordBidDecision(id, tenantId, decision, rationale);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("averagePwin", capturePlanService.getAverageWinProbability(tenantId));
        metrics.put("totalPipelineValue", capturePlanService.getTotalPipelineValue(tenantId));
        metrics.put("activePlans", capturePlanService.getActivePlans(tenantId).size());
        metrics.put("pendingDecisions", capturePlanService.getPendingBidDecision(tenantId).size());
        return ResponseEntity.ok(metrics);
    }

    // Action endpoints
    @GetMapping("/{planId}/actions")
    public ResponseEntity<List<CaptureAction>> getActions(
            @PathVariable UUID planId) {
        return ResponseEntity.ok(capturePlanService.getActionsByPlan(planId));
    }

    @GetMapping("/{planId}/actions/{actionId}")
    public ResponseEntity<CaptureAction> getAction(
            @PathVariable UUID planId,
            @PathVariable UUID actionId) {
        return capturePlanService.getAction(actionId, planId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{planId}/actions")
    public ResponseEntity<CaptureAction> createAction(
            @PathVariable UUID planId,
            @RequestBody CaptureAction action,
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        CaptureAction created = capturePlanService.createAction(action);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{planId}/actions/{actionId}")
    public ResponseEntity<CaptureAction> updateAction(
            @PathVariable UUID planId,
            @PathVariable UUID actionId,
            @RequestBody CaptureAction action) {
        if (!capturePlanService.getAction(actionId, planId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        action.setId(actionId);
        return ResponseEntity.ok(capturePlanService.updateAction(action));
    }

    @DeleteMapping("/{planId}/actions/{actionId}")
    public ResponseEntity<Void> deleteAction(
            @PathVariable UUID planId,
            @PathVariable UUID actionId) {
        if (!capturePlanService.getAction(actionId, planId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        capturePlanService.deleteAction(actionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{planId}/actions/{actionId}/complete")
    public ResponseEntity<CaptureAction> completeAction(
            @PathVariable UUID planId,
            @PathVariable UUID actionId,
            @RequestParam(required = false) String outcome) {
        try {
            CaptureAction completed = capturePlanService.completeAction(actionId, planId, outcome);
            return ResponseEntity.ok(completed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{planId}/actions/pending")
    public ResponseEntity<List<CaptureAction>> getPendingActions(
            @PathVariable UUID planId) {
        return ResponseEntity.ok(capturePlanService.getPendingActions(planId));
    }

    @GetMapping("/{planId}/actions/overdue")
    public ResponseEntity<List<CaptureAction>> getOverdueActions(
            @PathVariable UUID planId) {
        return ResponseEntity.ok(capturePlanService.getOverdueActions(planId));
    }

    @GetMapping("/{planId}/actions/completion-rate")
    public ResponseEntity<Map<String, Double>> getCompletionRate(
            @PathVariable UUID planId) {
        Map<String, Double> result = new HashMap<>();
        result.put("completionRate", capturePlanService.getActionCompletionRate(planId));
        return ResponseEntity.ok(result);
    }
}
