package com.samgov.ingestor.elasticsearch;

import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.ContractLevel;
import com.samgov.ingestor.model.Opportunity.DataSource;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.DateFormat;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Elasticsearch document representing an Opportunity for full-text search.
 *
 * This document mirrors the Opportunity entity but is optimized for search operations
 * with appropriate field mappings for text analysis, keyword filtering, and date ranges.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(indexName = "opportunities")
@Setting(shards = 1, replicas = 0)
public class OpportunityDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String title;

    @Field(type = FieldType.Keyword)
    private String solicitationNumber;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Date, format = DateFormat.date)
    private LocalDate postedDate;

    @Field(type = FieldType.Date, format = DateFormat.date)
    private LocalDate responseDeadline;

    @Field(type = FieldType.Keyword)
    private String naicsCode;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String naicsDescription;

    @Field(type = FieldType.Keyword)
    private String pscCode;

    @Field(type = FieldType.Keyword)
    private String type;

    @Field(type = FieldType.Text)
    private String typeDescription;

    @Field(type = FieldType.Keyword)
    private String url;

    // Agency information
    @Field(type = FieldType.Text, analyzer = "standard", fielddata = true)
    private String agency;

    @Field(type = FieldType.Keyword)
    private String agencyCode;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String subAgency;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String office;

    // Set-aside information
    @Field(type = FieldType.Keyword)
    private String setAsideType;

    @Field(type = FieldType.Text)
    private String setAsideDescription;

    // Place of performance
    @Field(type = FieldType.Text, analyzer = "standard")
    private String placeOfPerformanceCity;

    @Field(type = FieldType.Keyword)
    private String placeOfPerformanceState;

    @Field(type = FieldType.Keyword)
    private String placeOfPerformanceCountry;

    @Field(type = FieldType.Keyword)
    private String placeOfPerformanceZip;

    // Award information
    @Field(type = FieldType.Double)
    private BigDecimal awardAmount;

    @Field(type = FieldType.Double)
    private BigDecimal estimatedValueLow;

    @Field(type = FieldType.Double)
    private BigDecimal estimatedValueHigh;

    // Contract information
    @Field(type = FieldType.Keyword)
    private String contractType;

    @Field(type = FieldType.Keyword)
    private String contractNumber;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String incumbentContractor;

    @Field(type = FieldType.Boolean)
    private Boolean isRecoveryAct;

    // SBIR/STTR fields
    @Field(type = FieldType.Keyword)
    private String sbirPhase;

    @Field(type = FieldType.Boolean)
    private Boolean isSbir;

    @Field(type = FieldType.Boolean)
    private Boolean isSttr;

    // Contact information
    @Field(type = FieldType.Text)
    private String primaryContactName;

    @Field(type = FieldType.Keyword)
    private String primaryContactEmail;

    @Field(type = FieldType.Keyword)
    private String primaryContactPhone;

    @Field(type = FieldType.Text)
    private String secondaryContactName;

    @Field(type = FieldType.Keyword)
    private String secondaryContactEmail;

    // Source and status
    @Field(type = FieldType.Keyword)
    private String source;

    @Field(type = FieldType.Keyword)
    private DataSource dataSource;

    @Field(type = FieldType.Keyword)
    private ContractLevel contractLevel;

    @Field(type = FieldType.Keyword)
    private OpportunityStatus status;

    // State/Local specific fields
    @Field(type = FieldType.Text, analyzer = "standard")
    private String stateAgency;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String localEntity;

    @Field(type = FieldType.Keyword)
    private String procurementPortalUrl;

    @Field(type = FieldType.Keyword)
    private String bidNumber;

    // DoD specific fields
    @Field(type = FieldType.Boolean)
    private Boolean isDod;

    @Field(type = FieldType.Keyword)
    private String clearanceRequired;

    @Field(type = FieldType.Boolean)
    private Boolean itarControlled;

    @Field(type = FieldType.Boolean)
    private Boolean cuiRequired;

    // Metadata
    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second_millis)
    private Instant createdAt;

    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second_millis)
    private Instant updatedAt;

    @Field(type = FieldType.Date, format = DateFormat.date_hour_minute_second_millis)
    private Instant lastFetchedAt;

    /**
     * Creates an OpportunityDocument from an Opportunity entity.
     *
     * @param entity the source Opportunity entity
     * @return the corresponding OpportunityDocument for Elasticsearch indexing
     */
    public static OpportunityDocument fromEntity(Opportunity entity) {
        if (entity == null) {
            return null;
        }

        return OpportunityDocument.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .solicitationNumber(entity.getSolicitationNumber())
            .description(entity.getDescription())
            .postedDate(entity.getPostedDate())
            .responseDeadline(entity.getResponseDeadLine())
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
            .dataSource(entity.getDataSource())
            .contractLevel(entity.getContractLevel())
            .status(entity.getStatus())
            .stateAgency(entity.getStateAgency())
            .localEntity(entity.getLocalEntity())
            .procurementPortalUrl(entity.getProcurementPortalUrl())
            .bidNumber(entity.getBidNumber())
            .isDod(entity.getIsDod())
            .clearanceRequired(entity.getClearanceRequired())
            .itarControlled(entity.getItarControlled())
            .cuiRequired(entity.getCuiRequired())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .lastFetchedAt(entity.getLastFetchedAt())
            .build();
    }
}
