package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.PipelineService;
import com.samgov.ingestor.service.PipelineService.AddOpportunityRequest;
import com.samgov.ingestor.service.PipelineService.CreatePipelineRequest;
import com.samgov.ingestor.service.PipelineService.CreateStageRequest;
import com.samgov.ingestor.service.PipelineService.PipelineDto;
import com.samgov.ingestor.service.PipelineService.PipelineOpportunityDto;
import com.samgov.ingestor.service.PipelineService.PipelineSummaryDto;
import com.samgov.ingestor.service.PipelineService.SetBidDecisionRequest;
import com.samgov.ingestor.service.PipelineService.StageDto;
import com.samgov.ingestor.service.PipelineService.UpdatePipelineOpportunityRequest;
import com.samgov.ingestor.service.PipelineService.UpdatePipelineRequest;
import com.samgov.ingestor.service.PipelineService.UpdateStageRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/pipelines")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    // Pipeline endpoints

    @PostMapping
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_CREATE')")
    public ResponseEntity<PipelineDto> createPipeline(@Valid @RequestBody CreatePipelineRequest request) {
        log.info("Creating pipeline: {}", request.name());
        PipelineDto pipeline = pipelineService.createPipeline(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pipeline);
    }

    @GetMapping
    public ResponseEntity<List<PipelineDto>> getPipelines(
        @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        List<PipelineDto> pipelines = includeArchived
            ? pipelineService.getAllPipelines()
            : pipelineService.getActivePipelines();
        return ResponseEntity.ok(pipelines);
    }

    @GetMapping("/{pipelineId}")
    public ResponseEntity<PipelineDto> getPipeline(@PathVariable UUID pipelineId) {
        PipelineDto pipeline = pipelineService.getPipeline(pipelineId);
        return ResponseEntity.ok(pipeline);
    }

    @PutMapping("/{pipelineId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<PipelineDto> updatePipeline(
        @PathVariable UUID pipelineId,
        @Valid @RequestBody UpdatePipelineRequest request
    ) {
        PipelineDto pipeline = pipelineService.updatePipeline(pipelineId, request);
        return ResponseEntity.ok(pipeline);
    }

    @PostMapping("/{pipelineId}/set-default")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<Void> setDefaultPipeline(@PathVariable UUID pipelineId) {
        pipelineService.setDefaultPipeline(pipelineId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{pipelineId}/archive")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<Void> archivePipeline(@PathVariable UUID pipelineId) {
        pipelineService.archivePipeline(pipelineId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pipelineId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_DELETE')")
    public ResponseEntity<Void> deletePipeline(@PathVariable UUID pipelineId) {
        pipelineService.deletePipeline(pipelineId);
        return ResponseEntity.noContent().build();
    }

    // Stage endpoints

    @PostMapping("/{pipelineId}/stages")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<StageDto> addStage(
        @PathVariable UUID pipelineId,
        @Valid @RequestBody CreateStageRequest request
    ) {
        StageDto stage = pipelineService.addStage(pipelineId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(stage);
    }

    @PutMapping("/{pipelineId}/stages/{stageId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<StageDto> updateStage(
        @PathVariable UUID pipelineId,
        @PathVariable UUID stageId,
        @Valid @RequestBody UpdateStageRequest request
    ) {
        StageDto stage = pipelineService.updateStage(pipelineId, stageId, request);
        return ResponseEntity.ok(stage);
    }

    @PostMapping("/{pipelineId}/stages/reorder")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<Void> reorderStages(
        @PathVariable UUID pipelineId,
        @RequestBody List<UUID> stageIds
    ) {
        pipelineService.reorderStages(pipelineId, stageIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pipelineId}/stages/{stageId}")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_UPDATE')")
    public ResponseEntity<Void> deleteStage(
        @PathVariable UUID pipelineId,
        @PathVariable UUID stageId,
        @RequestParam(required = false) UUID moveToStageId
    ) {
        pipelineService.deleteStage(pipelineId, stageId, moveToStageId);
        return ResponseEntity.noContent().build();
    }

    // Pipeline Opportunity endpoints

    @PostMapping("/{pipelineId}/opportunities")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_OPPORTUNITY_CREATE')")
    public ResponseEntity<PipelineOpportunityDto> addOpportunityToPipeline(
        @PathVariable UUID pipelineId,
        @Valid @RequestBody AddOpportunityRequest request
    ) {
        log.info("Adding opportunity {} to pipeline {}", request.opportunityId(), pipelineId);
        PipelineOpportunityDto pipelineOpp = pipelineService.addOpportunityToPipeline(pipelineId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pipelineOpp);
    }

    @GetMapping("/{pipelineId}/opportunities")
    public ResponseEntity<Page<PipelineOpportunityDto>> getPipelineOpportunities(
        @PathVariable UUID pipelineId,
        @RequestParam(required = false) UUID stageId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PipelineOpportunityDto> opportunities = pipelineService.getPipelineOpportunities(pipelineId, stageId, pageable);
        return ResponseEntity.ok(opportunities);
    }

    @GetMapping("/{pipelineId}/opportunities/{id}")
    public ResponseEntity<PipelineOpportunityDto> getPipelineOpportunity(
        @PathVariable UUID pipelineId,
        @PathVariable UUID id
    ) {
        PipelineOpportunityDto opportunity = pipelineService.getPipelineOpportunity(pipelineId, id);
        return ResponseEntity.ok(opportunity);
    }

    @PatchMapping("/{pipelineId}/opportunities/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_OPPORTUNITY_UPDATE')")
    public ResponseEntity<PipelineOpportunityDto> updatePipelineOpportunity(
        @PathVariable UUID pipelineId,
        @PathVariable UUID id,
        @Valid @RequestBody UpdatePipelineOpportunityRequest request
    ) {
        PipelineOpportunityDto opportunity = pipelineService.updatePipelineOpportunity(pipelineId, id, request);
        return ResponseEntity.ok(opportunity);
    }

    @PostMapping("/{pipelineId}/opportunities/{id}/move")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_OPPORTUNITY_UPDATE')")
    public ResponseEntity<PipelineOpportunityDto> moveOpportunityToStage(
        @PathVariable UUID pipelineId,
        @PathVariable UUID id,
        @RequestParam UUID stageId
    ) {
        // Note: using id as opportunityId from PipelineOpportunity
        PipelineOpportunityDto opportunity = pipelineService.moveOpportunityToStage(pipelineId, id, stageId);
        return ResponseEntity.ok(opportunity);
    }

    @PostMapping("/{pipelineId}/opportunities/{id}/decision")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_OPPORTUNITY_UPDATE')")
    public ResponseEntity<PipelineOpportunityDto> setBidDecision(
        @PathVariable UUID pipelineId,
        @PathVariable UUID id,
        @Valid @RequestBody SetBidDecisionRequest request
    ) {
        log.info("Setting bid decision for opportunity {} in pipeline {}: {}", id, pipelineId, request.decision());
        PipelineOpportunityDto opportunity = pipelineService.setBidDecision(pipelineId, id, request);
        return ResponseEntity.ok(opportunity);
    }

    @DeleteMapping("/{pipelineId}/opportunities/{id}")
    @PreAuthorize("@tenantSecurityService.hasPermission('PIPELINE_OPPORTUNITY_DELETE')")
    public ResponseEntity<Void> removeOpportunityFromPipeline(
        @PathVariable UUID pipelineId,
        @PathVariable UUID id
    ) {
        pipelineService.removeOpportunityFromPipeline(pipelineId, id);
        return ResponseEntity.noContent().build();
    }

    // Analytics endpoints

    @GetMapping("/{pipelineId}/summary")
    public ResponseEntity<PipelineSummaryDto> getPipelineSummary(@PathVariable UUID pipelineId) {
        PipelineSummaryDto summary = pipelineService.getPipelineSummary(pipelineId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{pipelineId}/approaching-deadlines")
    public ResponseEntity<List<PipelineOpportunityDto>> getApproachingDeadlines(
        @PathVariable UUID pipelineId,
        @RequestParam(defaultValue = "7") int daysAhead
    ) {
        List<PipelineOpportunityDto> opportunities = pipelineService.getApproachingDeadlines(pipelineId, daysAhead);
        return ResponseEntity.ok(opportunities);
    }

    @GetMapping("/{pipelineId}/stale")
    public ResponseEntity<List<PipelineOpportunityDto>> getStaleOpportunities(
        @PathVariable UUID pipelineId,
        @RequestParam(defaultValue = "14") int staleDays
    ) {
        List<PipelineOpportunityDto> opportunities = pipelineService.getStaleOpportunities(pipelineId, staleDays);
        return ResponseEntity.ok(opportunities);
    }
}
