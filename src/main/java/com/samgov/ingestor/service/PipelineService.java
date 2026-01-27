package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Pipeline;
import com.samgov.ingestor.model.PipelineOpportunity;
import com.samgov.ingestor.model.PipelineOpportunity.BidDecision;
import com.samgov.ingestor.model.PipelineStage;
import com.samgov.ingestor.model.PipelineStage.StageType;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.OpportunityRepository;
import com.samgov.ingestor.repository.PipelineOpportunityRepository;
import com.samgov.ingestor.repository.PipelineRepository;
import com.samgov.ingestor.repository.PipelineStageRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PipelineService {

    private final PipelineRepository pipelineRepository;
    private final PipelineStageRepository stageRepository;
    private final PipelineOpportunityRepository pipelineOpportunityRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final OpportunityRepository opportunityRepository;
    private final AuditService auditService;
    private final EntityManager entityManager;

    // Pipeline CRUD

    @Transactional
    public PipelineDto createPipeline(CreatePipelineRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        if (pipelineRepository.existsByTenantIdAndName(tenantId, request.name())) {
            throw new IllegalArgumentException("Pipeline with this name already exists");
        }

        Pipeline pipeline = Pipeline.builder()
            .tenant(tenant)
            .name(request.name())
            .description(request.description())
            .isDefault(false)
            .isArchived(false)
            .build();

        // Create default stages if none provided
        List<CreateStageRequest> stages = request.stages();
        if (stages == null || stages.isEmpty()) {
            stages = getDefaultStages();
        }

        int position = 0;
        for (CreateStageRequest stageRequest : stages) {
            PipelineStage stage = PipelineStage.builder()
                .pipeline(pipeline)
                .name(stageRequest.name())
                .description(stageRequest.description())
                .position(position++)
                .color(stageRequest.color())
                .stageType(stageRequest.stageType() != null ? stageRequest.stageType() : StageType.IN_PROGRESS)
                .probabilityOfWin(stageRequest.probability())
                .build();
            pipeline.addStage(stage);
        }

        Pipeline saved = pipelineRepository.save(pipeline);

        // If this is the first pipeline, make it default
        if (pipelineRepository.countByTenantId(tenantId) == 1) {
            saved.setIsDefault(true);
            pipelineRepository.save(saved);
        }

        auditService.logAction(AuditAction.PIPELINE_CREATED, "Pipeline", saved.getId().toString(),
            "Created pipeline: " + saved.getName());

        return toDto(saved);
    }

    public PipelineDto getPipeline(UUID pipelineId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pipeline pipeline = pipelineRepository.findByTenantIdAndIdWithStages(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));
        return toDto(pipeline);
    }

    public List<PipelineDto> getActivePipelines() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return pipelineRepository.findByTenantIdAndIsArchivedFalse(tenantId)
            .stream()
            .map(this::toDto)
            .toList();
    }

    public List<PipelineDto> getAllPipelines() {
        UUID tenantId = TenantContext.getCurrentTenantId();
        return pipelineRepository.findByTenantId(tenantId)
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional
    public PipelineDto updatePipeline(UUID pipelineId, UpdatePipelineRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pipeline pipeline = pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        if (request.name() != null && !request.name().equals(pipeline.getName())) {
            if (pipelineRepository.existsByTenantIdAndName(tenantId, request.name())) {
                throw new IllegalArgumentException("Pipeline with this name already exists");
            }
            pipeline.setName(request.name());
        }

        if (request.description() != null) {
            pipeline.setDescription(request.description());
        }

        Pipeline saved = pipelineRepository.save(pipeline);
        auditService.logAction(AuditAction.PIPELINE_UPDATED, "Pipeline", saved.getId().toString(),
            "Updated pipeline: " + saved.getName());
        return toDto(saved);
    }

    @Transactional
    public void setDefaultPipeline(UUID pipelineId) {
        UUID tenantId = TenantContext.getCurrentTenantId();

        // Clear current default
        pipelineRepository.findByTenantIdAndIsDefaultTrue(tenantId)
            .ifPresent(p -> {
                p.setIsDefault(false);
                pipelineRepository.save(p);
            });

        // Set new default
        Pipeline pipeline = pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));
        pipeline.setIsDefault(true);
        pipelineRepository.save(pipeline);

        auditService.logAction(AuditAction.PIPELINE_DEFAULT_SET, "Pipeline", pipelineId.toString(),
            "Set as default pipeline: " + pipeline.getName());
    }

    @Transactional
    public void archivePipeline(UUID pipelineId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pipeline pipeline = pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        if (pipeline.getIsDefault()) {
            throw new IllegalStateException("Cannot archive default pipeline");
        }

        pipeline.setIsArchived(true);
        pipelineRepository.save(pipeline);

        auditService.logAction(AuditAction.PIPELINE_ARCHIVED, "Pipeline", pipelineId.toString(),
            "Archived pipeline: " + pipeline.getName());
    }

    @Transactional
    public void deletePipeline(UUID pipelineId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pipeline pipeline = pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        if (pipeline.getIsDefault()) {
            throw new IllegalStateException("Cannot delete default pipeline");
        }

        long opportunityCount = pipelineOpportunityRepository.countByPipelineId(pipelineId);
        if (opportunityCount > 0) {
            throw new IllegalStateException("Cannot delete pipeline with opportunities. Archive it instead.");
        }

        pipelineRepository.delete(pipeline);

        auditService.logAction(AuditAction.PIPELINE_DELETED, "Pipeline", pipelineId.toString(),
            "Deleted pipeline: " + pipeline.getName());
    }

    // Stage management

    @Transactional
    public StageDto addStage(UUID pipelineId, CreateStageRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pipeline pipeline = pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        if (stageRepository.existsByPipelineIdAndName(pipelineId, request.name())) {
            throw new IllegalArgumentException("Stage with this name already exists");
        }

        Integer maxPosition = stageRepository.findMaxPositionByPipelineId(pipelineId).orElse(-1);
        int newPosition = request.position() != null ? request.position() : maxPosition + 1;

        // Shift existing stages if inserting in middle
        if (request.position() != null && request.position() <= maxPosition) {
            stageRepository.incrementPositionsFrom(pipelineId, newPosition);
        }

        PipelineStage stage = PipelineStage.builder()
            .pipeline(pipeline)
            .name(request.name())
            .description(request.description())
            .position(newPosition)
            .color(request.color())
            .stageType(request.stageType() != null ? request.stageType() : StageType.IN_PROGRESS)
            .probabilityOfWin(request.probability())
            .build();

        PipelineStage saved = stageRepository.save(stage);
        return toStageDto(saved);
    }

    @Transactional
    public StageDto updateStage(UUID pipelineId, UUID stageId, UpdateStageRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineStage stage = stageRepository.findByPipelineIdAndId(pipelineId, stageId)
            .orElseThrow(() -> new ResourceNotFoundException("Stage not found"));

        if (request.name() != null) {
            stage.setName(request.name());
        }
        if (request.description() != null) {
            stage.setDescription(request.description());
        }
        if (request.color() != null) {
            stage.setColor(request.color());
        }
        if (request.stageType() != null) {
            stage.setStageType(request.stageType());
        }
        if (request.probability() != null) {
            stage.setProbabilityOfWin(request.probability());
        }

        PipelineStage saved = stageRepository.save(stage);
        return toStageDto(saved);
    }

    @Transactional
    public void reorderStages(UUID pipelineId, List<UUID> stageIds) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        int position = 0;
        for (UUID stageId : stageIds) {
            PipelineStage stage = stageRepository.findByPipelineIdAndId(pipelineId, stageId)
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found: " + stageId));
            stage.setPosition(position++);
            stageRepository.save(stage);
        }
    }

    @Transactional
    public void deleteStage(UUID pipelineId, UUID stageId, UUID moveToStageId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineStage stage = stageRepository.findByPipelineIdAndId(pipelineId, stageId)
            .orElseThrow(() -> new ResourceNotFoundException("Stage not found"));

        List<PipelineOpportunity> opportunities = pipelineOpportunityRepository.findByStageId(stageId);

        if (!opportunities.isEmpty()) {
            if (moveToStageId == null) {
                throw new IllegalArgumentException("Must specify a stage to move opportunities to");
            }
            PipelineStage targetStage = stageRepository.findByPipelineIdAndId(pipelineId, moveToStageId)
                .orElseThrow(() -> new ResourceNotFoundException("Target stage not found"));

            for (PipelineOpportunity opp : opportunities) {
                opp.moveToStage(targetStage);
                pipelineOpportunityRepository.save(opp);
            }
        }

        int deletedPosition = stage.getPosition();
        UUID stageIdToDelete = stage.getId();
        stageRepository.deleteStageById(stageIdToDelete);
        stageRepository.decrementPositionsAfter(pipelineId, deletedPosition);
    }

    // Pipeline Opportunity management

    @Transactional
    public PipelineOpportunityDto addOpportunityToPipeline(UUID pipelineId, AddOpportunityRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        UUID userId = TenantContext.getCurrentUserId();

        Pipeline pipeline = pipelineRepository.findByTenantIdAndIdWithStages(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Opportunity opportunity = opportunityRepository.findById(request.opportunityId())
            .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));

        if (pipelineOpportunityRepository.existsByPipelineIdAndOpportunityId(pipelineId, opportunity.getId())) {
            throw new IllegalArgumentException("Opportunity already in this pipeline");
        }

        // Get target stage
        PipelineStage stage;
        if (request.stageId() != null) {
            stage = stageRepository.findByPipelineIdAndId(pipelineId, request.stageId())
                .orElseThrow(() -> new ResourceNotFoundException("Stage not found"));
        } else {
            stage = stageRepository.findFirstByPipelineIdOrderByPositionAsc(pipelineId)
                .orElseThrow(() -> new IllegalStateException("Pipeline has no stages"));
        }

        User addedBy = userRepository.findById(userId).orElse(null);
        User owner = null;
        if (request.ownerId() != null) {
            owner = userRepository.findById(request.ownerId()).orElse(null);
        }

        PipelineOpportunity pipelineOpp = PipelineOpportunity.builder()
            .tenant(tenant)
            .pipeline(pipeline)
            .opportunity(opportunity)
            .stage(stage)
            .owner(owner)
            .addedBy(addedBy)
            .internalName(request.internalName())
            .notes(request.notes())
            .decision(BidDecision.PENDING)
            .estimatedValue(request.estimatedValue())
            .probabilityOfWin(stage.getProbabilityOfWin())
            .build();

        PipelineOpportunity saved = pipelineOpportunityRepository.save(pipelineOpp);

        auditService.logAction(AuditAction.OPPORTUNITY_ADDED_TO_PIPELINE, "PipelineOpportunity", saved.getId().toString(),
            "Added opportunity to pipeline: " + opportunity.getSolicitationNumber());

        return toPipelineOpportunityDto(saved);
    }

    @Transactional
    public PipelineOpportunityDto moveOpportunityToStage(UUID pipelineId, UUID pipelineOpportunityId, UUID stageId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineOpportunity pipelineOpp = pipelineOpportunityRepository.findById(pipelineOpportunityId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline opportunity not found"));

        PipelineStage newStage = stageRepository.findByPipelineIdAndId(pipelineId, stageId)
            .orElseThrow(() -> new ResourceNotFoundException("Stage not found"));

        UUID oldStageId = pipelineOpp.getStage().getId();
        pipelineOpp.moveToStage(newStage);

        PipelineOpportunity saved = pipelineOpportunityRepository.save(pipelineOpp);

        auditService.logAction(AuditAction.OPPORTUNITY_STAGE_CHANGED, "PipelineOpportunity", saved.getId().toString(),
            "Moved to stage: " + newStage.getName());

        return toPipelineOpportunityDto(saved);
    }

    @Transactional
    public PipelineOpportunityDto updatePipelineOpportunity(UUID pipelineId, UUID id, UpdatePipelineOpportunityRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineOpportunity pipelineOpp = pipelineOpportunityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline opportunity not found"));

        if (request.internalName() != null) {
            pipelineOpp.setInternalName(request.internalName());
        }
        if (request.notes() != null) {
            pipelineOpp.setNotes(request.notes());
        }
        if (request.estimatedValue() != null) {
            pipelineOpp.setEstimatedValue(request.estimatedValue());
        }
        if (request.probabilityOfWin() != null) {
            pipelineOpp.setProbabilityOfWin(request.probabilityOfWin());
        }
        if (request.captureManager() != null) {
            pipelineOpp.setCaptureManager(request.captureManager());
        }
        if (request.proposalManager() != null) {
            pipelineOpp.setProposalManager(request.proposalManager());
        }
        if (request.teamingPartners() != null) {
            pipelineOpp.setTeamingPartners(request.teamingPartners());
        }
        if (request.winThemes() != null) {
            pipelineOpp.setWinThemes(request.winThemes());
        }
        if (request.discriminators() != null) {
            pipelineOpp.setDiscriminators(request.discriminators());
        }
        if (request.internalDeadline() != null) {
            pipelineOpp.setInternalDeadline(request.internalDeadline());
        }
        if (request.reviewDate() != null) {
            pipelineOpp.setReviewDate(request.reviewDate());
        }
        if (request.ownerId() != null) {
            User owner = userRepository.findById(request.ownerId()).orElse(null);
            pipelineOpp.setOwner(owner);
        }

        PipelineOpportunity saved = pipelineOpportunityRepository.save(pipelineOpp);
        return toPipelineOpportunityDto(saved);
    }

    @Transactional
    public PipelineOpportunityDto setBidDecision(UUID pipelineId, UUID id, SetBidDecisionRequest request) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineOpportunity pipelineOpp = pipelineOpportunityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline opportunity not found"));

        pipelineOpp.setDecision(request.decision());
        pipelineOpp.setDecisionDate(LocalDate.now());
        pipelineOpp.setDecisionNotes(request.notes());

        // Auto-move to appropriate stage based on decision
        if (request.autoMoveStage() != null && request.autoMoveStage()) {
            StageType targetType = switch (request.decision()) {
                case BID -> StageType.IN_PROGRESS;
                case NO_BID -> StageType.LOST;
                default -> null;
            };

            if (targetType != null) {
                stageRepository.findByPipelineIdAndStageType(pipelineId, targetType)
                    .ifPresent(pipelineOpp::moveToStage);
            }
        }

        PipelineOpportunity saved = pipelineOpportunityRepository.save(pipelineOpp);

        auditService.logAction(AuditAction.BID_DECISION_SET, "PipelineOpportunity", id.toString(),
            "Bid decision: " + request.decision());

        return toPipelineOpportunityDto(saved);
    }

    public Page<PipelineOpportunityDto> getPipelineOpportunities(UUID pipelineId, UUID stageId, Pageable pageable) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        Page<PipelineOpportunity> page;
        if (stageId != null) {
            page = pipelineOpportunityRepository.findByPipelineIdAndStageId(pipelineId, stageId, pageable);
        } else {
            page = pipelineOpportunityRepository.findByPipelineId(pipelineId, pageable);
        }

        return page.map(this::toPipelineOpportunityDto);
    }

    public PipelineOpportunityDto getPipelineOpportunity(UUID pipelineId, UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineOpportunity pipelineOpp = pipelineOpportunityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline opportunity not found"));

        return toPipelineOpportunityDto(pipelineOpp);
    }

    @Transactional
    public void removeOpportunityFromPipeline(UUID pipelineId, UUID id) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        PipelineOpportunity pipelineOpp = pipelineOpportunityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline opportunity not found"));

        pipelineOpportunityRepository.delete(pipelineOpp);

        auditService.logAction(AuditAction.OPPORTUNITY_REMOVED_FROM_PIPELINE, "PipelineOpportunity", id.toString(),
            "Removed from pipeline");
    }

    // Analytics

    public PipelineSummaryDto getPipelineSummary(UUID pipelineId) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        Pipeline pipeline = pipelineRepository.findByTenantIdAndIdWithStages(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        List<StageSummaryDto> stageSummaries = new ArrayList<>();
        for (PipelineStage stage : pipeline.getStages()) {
            long count = pipelineOpportunityRepository.countByStageId(stage.getId());
            BigDecimal totalValue = pipelineOpportunityRepository.sumEstimatedValueByStageId(stage.getId())
                .orElse(BigDecimal.ZERO);
            BigDecimal weightedValue = pipelineOpportunityRepository.sumWeightedValueByStageId(stage.getId())
                .orElse(BigDecimal.ZERO);

            stageSummaries.add(new StageSummaryDto(
                stage.getId(),
                stage.getName(),
                stage.getColor(),
                stage.getStageType(),
                count,
                totalValue,
                weightedValue
            ));
        }

        long totalOpportunities = pipelineOpportunityRepository.countByPipelineId(pipelineId);
        BigDecimal totalValue = pipelineOpportunityRepository.sumEstimatedValueByPipelineId(pipelineId)
            .orElse(BigDecimal.ZERO);
        BigDecimal totalWeightedValue = pipelineOpportunityRepository.sumWeightedValueByPipelineId(pipelineId)
            .orElse(BigDecimal.ZERO);

        long bidCount = pipelineOpportunityRepository.countByPipelineIdAndDecision(pipelineId, BidDecision.BID);
        long noBidCount = pipelineOpportunityRepository.countByPipelineIdAndDecision(pipelineId, BidDecision.NO_BID);
        long pendingCount = pipelineOpportunityRepository.countByPipelineIdAndDecision(pipelineId, BidDecision.PENDING);

        return new PipelineSummaryDto(
            pipeline.getId(),
            pipeline.getName(),
            totalOpportunities,
            totalValue,
            totalWeightedValue,
            bidCount,
            noBidCount,
            pendingCount,
            stageSummaries
        );
    }

    public List<PipelineOpportunityDto> getApproachingDeadlines(UUID pipelineId, int daysAhead) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        LocalDate deadline = LocalDate.now().plusDays(daysAhead);
        return pipelineOpportunityRepository.findApproachingDeadlines(pipelineId, deadline)
            .stream()
            .map(this::toPipelineOpportunityDto)
            .toList();
    }

    public List<PipelineOpportunityDto> getStaleOpportunities(UUID pipelineId, int staleDays) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        pipelineRepository.findByTenantIdAndId(tenantId, pipelineId)
            .orElseThrow(() -> new ResourceNotFoundException("Pipeline not found"));

        Instant threshold = Instant.now().minus(staleDays, ChronoUnit.DAYS);
        return pipelineOpportunityRepository.findStaleOpportunities(pipelineId, threshold)
            .stream()
            .map(this::toPipelineOpportunityDto)
            .toList();
    }

    // Helper methods

    private List<CreateStageRequest> getDefaultStages() {
        return List.of(
            new CreateStageRequest("Identified", "Newly identified opportunities", 0, "#6B7280", StageType.INITIAL, 10),
            new CreateStageRequest("Qualifying", "Evaluating fit and feasibility", 1, "#3B82F6", StageType.IN_PROGRESS, 25),
            new CreateStageRequest("Pursuing", "Actively pursuing", 2, "#8B5CF6", StageType.IN_PROGRESS, 50),
            new CreateStageRequest("Proposing", "Proposal in development", 3, "#F59E0B", StageType.IN_PROGRESS, 75),
            new CreateStageRequest("Submitted", "Proposal submitted", 4, "#10B981", StageType.IN_PROGRESS, 90),
            new CreateStageRequest("Won", "Contract awarded", 5, "#059669", StageType.WON, 100),
            new CreateStageRequest("Lost", "Did not win or no-bid", 6, "#EF4444", StageType.LOST, 0)
        );
    }

    private PipelineDto toDto(Pipeline pipeline) {
        // Query stages directly from repository to ensure fresh data
        // This avoids stale JPA collection caching issues in transactional contexts
        List<StageDto> stages = stageRepository.findByPipelineIdOrderByPositionAsc(pipeline.getId())
            .stream()
            .map(this::toStageDto)
            .toList();

        return new PipelineDto(
            pipeline.getId(),
            pipeline.getName(),
            pipeline.getDescription(),
            pipeline.getIsDefault(),
            pipeline.getIsArchived(),
            stages,
            pipeline.getCreatedAt(),
            pipeline.getUpdatedAt()
        );
    }

    private StageDto toStageDto(PipelineStage stage) {
        return new StageDto(
            stage.getId(),
            stage.getName(),
            stage.getDescription(),
            stage.getPosition(),
            stage.getColor(),
            stage.getStageType(),
            stage.getProbabilityOfWin()
        );
    }

    private PipelineOpportunityDto toPipelineOpportunityDto(PipelineOpportunity po) {
        return new PipelineOpportunityDto(
            po.getId(),
            po.getPipeline().getId(),
            po.getOpportunity().getId(),
            po.getOpportunity().getSolicitationNumber(),
            po.getOpportunity().getTitle(),
            po.getStage().getId(),
            po.getStage().getName(),
            po.getOwner() != null ? po.getOwner().getId() : null,
            po.getOwner() != null ? po.getOwner().getFirstName() + " " + po.getOwner().getLastName() : null,
            po.getInternalName(),
            po.getNotes(),
            po.getDecision(),
            po.getDecisionDate(),
            po.getDecisionNotes(),
            po.getEstimatedValue(),
            po.getProbabilityOfWin(),
            po.getWeightedValue(),
            po.getCaptureManager(),
            po.getProposalManager(),
            po.getTeamingPartners(),
            po.getWinThemes(),
            po.getDiscriminators(),
            po.getInternalDeadline(),
            po.getReviewDate(),
            po.getOpportunity().getResponseDeadLine(),
            po.getStageEnteredAt(),
            po.getCreatedAt(),
            po.getUpdatedAt()
        );
    }

    // DTOs

    public record CreatePipelineRequest(
        String name,
        String description,
        List<CreateStageRequest> stages
    ) {}

    public record UpdatePipelineRequest(
        String name,
        String description
    ) {}

    public record CreateStageRequest(
        String name,
        String description,
        Integer position,
        String color,
        StageType stageType,
        Integer probability
    ) {}

    public record UpdateStageRequest(
        String name,
        String description,
        String color,
        StageType stageType,
        Integer probability
    ) {}

    public record AddOpportunityRequest(
        String opportunityId,
        UUID stageId,
        UUID ownerId,
        String internalName,
        String notes,
        BigDecimal estimatedValue
    ) {}

    public record UpdatePipelineOpportunityRequest(
        String internalName,
        String notes,
        BigDecimal estimatedValue,
        Integer probabilityOfWin,
        String captureManager,
        String proposalManager,
        String teamingPartners,
        String winThemes,
        String discriminators,
        LocalDate internalDeadline,
        LocalDate reviewDate,
        UUID ownerId
    ) {}

    public record SetBidDecisionRequest(
        BidDecision decision,
        String notes,
        Boolean autoMoveStage
    ) {}

    public record PipelineDto(
        UUID id,
        String name,
        String description,
        Boolean isDefault,
        Boolean isArchived,
        List<StageDto> stages,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record StageDto(
        UUID id,
        String name,
        String description,
        Integer position,
        String color,
        StageType stageType,
        Integer probability
    ) {}

    public record PipelineOpportunityDto(
        UUID id,
        UUID pipelineId,
        String opportunityId,
        String solicitationNumber,
        String opportunityTitle,
        UUID stageId,
        String stageName,
        UUID ownerId,
        String ownerName,
        String internalName,
        String notes,
        BidDecision decision,
        LocalDate decisionDate,
        String decisionNotes,
        BigDecimal estimatedValue,
        Integer probabilityOfWin,
        BigDecimal weightedValue,
        String captureManager,
        String proposalManager,
        String teamingPartners,
        String winThemes,
        String discriminators,
        LocalDate internalDeadline,
        LocalDate reviewDate,
        LocalDate responseDeadline,
        Instant stageEnteredAt,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record PipelineSummaryDto(
        UUID pipelineId,
        String pipelineName,
        long totalOpportunities,
        BigDecimal totalValue,
        BigDecimal totalWeightedValue,
        long bidCount,
        long noBidCount,
        long pendingCount,
        List<StageSummaryDto> stages
    ) {}

    public record StageSummaryDto(
        UUID stageId,
        String stageName,
        String color,
        StageType stageType,
        long opportunityCount,
        BigDecimal totalValue,
        BigDecimal weightedValue
    ) {}
}
