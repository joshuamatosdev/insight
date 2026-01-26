package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Builder
public record OpportunityDto(
    String id,
    String title,
    String solicitationNumber,
    String description,
    LocalDate postedDate,
    LocalDate responseDeadline,
    LocalDate archiveDate,
    String naicsCode,
    String naicsDescription,
    String pscCode,
    String type,
    String typeDescription,
    String url,
    String agency,
    String agencyCode,
    String subAgency,
    String office,
    String setAsideType,
    String setAsideDescription,
    String placeOfPerformanceCity,
    String placeOfPerformanceState,
    String placeOfPerformanceCountry,
    String placeOfPerformanceZip,
    BigDecimal awardAmount,
    BigDecimal estimatedValueLow,
    BigDecimal estimatedValueHigh,
    String contractType,
    String contractNumber,
    String incumbentContractor,
    Boolean isRecoveryAct,
    String sbirPhase,
    Boolean isSbir,
    Boolean isSttr,
    String primaryContactName,
    String primaryContactEmail,
    String primaryContactPhone,
    String secondaryContactName,
    String secondaryContactEmail,
    String source,
    OpportunityStatus status,
    Instant createdAt,
    Instant updatedAt,
    // Computed fields
    Boolean isPastDeadline,
    Boolean isClosingSoon,
    Long daysUntilDeadline
) {
    public static OpportunityDto fromEntity(Opportunity entity) {
        return OpportunityDto.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .solicitationNumber(entity.getSolicitationNumber())
            .description(entity.getDescription())
            .postedDate(entity.getPostedDate())
            .responseDeadline(entity.getResponseDeadLine())
            .archiveDate(entity.getArchiveDate())
            .naicsCode(entity.getNaicsCode())
            .naicsDescription(entity.getNaicsDescription())
            .pscCode(entity.getPscCode())
            .type(entity.getType())
            .typeDescription(entity.getTypeDescription())
            .url(entity.getUrl())
            .agency(entity.getAgency())
            .agencyCode(entity.getAgencyCode())
            .subAgency(entity.getSubAgency())
            .office(entity.getOffice())
            .setAsideType(entity.getSetAsideType())
            .setAsideDescription(entity.getSetAsideDescription())
            .placeOfPerformanceCity(entity.getPlaceOfPerformanceCity())
            .placeOfPerformanceState(entity.getPlaceOfPerformanceState())
            .placeOfPerformanceCountry(entity.getPlaceOfPerformanceCountry())
            .placeOfPerformanceZip(entity.getPlaceOfPerformanceZip())
            .awardAmount(entity.getAwardAmount())
            .estimatedValueLow(entity.getEstimatedValueLow())
            .estimatedValueHigh(entity.getEstimatedValueHigh())
            .contractType(entity.getContractType())
            .contractNumber(entity.getContractNumber())
            .incumbentContractor(entity.getIncumbentContractor())
            .isRecoveryAct(entity.getIsRecoveryAct())
            .sbirPhase(entity.getSbirPhase())
            .isSbir(entity.getIsSbir())
            .isSttr(entity.getIsSttr())
            .primaryContactName(entity.getPrimaryContactName())
            .primaryContactEmail(entity.getPrimaryContactEmail())
            .primaryContactPhone(entity.getPrimaryContactPhone())
            .secondaryContactName(entity.getSecondaryContactName())
            .secondaryContactEmail(entity.getSecondaryContactEmail())
            .source(entity.getSource())
            .status(entity.getStatus())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .isPastDeadline(entity.isPastDeadline())
            .isClosingSoon(entity.isClosingSoon())
            .daysUntilDeadline(entity.getDaysUntilDeadline())
            .build();
    }
}
